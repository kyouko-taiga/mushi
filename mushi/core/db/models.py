# Copyright 2015 Dimitri Racordon
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import division

from hashlib import md5

from flask import current_app

from sqlalchemy import Boolean, Column, Enum, ForeignKey, Integer, String, Table
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.ext.declarative import as_declarative, declared_attr
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import backref, relationship

from mushi.core.exc import InvalidArgumentError
from mushi.core.utils.time import utcnow

from . import db_session
from .dictionarization import Dictionarizable
from .types import UtcDateTime


@as_declarative()
class Base(object):

    query = db_session.query_property()

    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()

    def update(self, data):
        for attr, value in data.items():
            setattr(self, attr, value)


class User(Base, Dictionarizable):

    _dictionarizable_attrs = ('email', 'name', 'profile_picture')

    email = Column(String, nullable=False, primary_key=True)
    password = Column(String, nullable=False)
    name = Column(String, nullable=False)

    @property
    def profile_picture(self):
        mailhash = md5(self.email.strip().lower().encode()).hexdigest()
        return '//www.gravatar.com/avatar/' + mailhash

    def __str__(self):
        return '%s (%s)' % (self.name, self.email)

    def __repr__(self):
        return '<User %r>' % (self.email)


class Token(Base, Dictionarizable):

    _dictionarizable_attrs = ('value', 'owner', 'expires_at', 'has_expired')

    value = Column(String, nullable=False, primary_key=True)
    expires_at = Column(UtcDateTime, default=utcnow)

    owner_email = Column(String, ForeignKey('user.email'), nullable=False)
    owner = relationship('User', backref='tokens')

    @hybrid_property
    def has_expired(self):
        return utcnow() > self.expires_at

    def __str__(self):
        return self.value

    def __repr__(self):
        return '<Token %r>' % (self.value)


class Tag(Base, Dictionarizable):

    _dictionarizable_attrs = ('name', 'description', 'color')

    name = Column(String, nullable=False, primary_key=True)
    description = Column(String)
    color = Column(String, nullable=False, default='#ffffff')

    def __str__(self):
        return self.name

    def __repr__(self):
        return '<Tag %r>' % self.name


class Tagged(object):

    def update_tags(self, data):
        # Retrieve the optional tags the model is to be assigned to.
        if 'tags' in data:
            tags = []
            for tag_name in data.pop('tags'):
                try:
                    tags.append(db_session.query(Tag).filter(Tag.name == tag_name).one())
                except NoResultFound:
                    raise InvalidArgumentError("No such tag: '%s'." % tag_name)
            self.tags = tags


class Milestone(Base, Tagged, Dictionarizable):

    _dictionarizable_attrs = (
        'slug', 'name', 'description', 'status', 'due_date', 'progress', 'tags',
        'open_count', 'closed_count', 'progress')

    slug = Column(String, nullable=False, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(Enum('open', 'closed'), default='open')
    due_date = Column(UtcDateTime, default=None)
    updated_at = Column(UtcDateTime, default=utcnow)
    progress = Column(Integer, default=0)

    tags = relationship(
        'Tag',
        secondary=Table(
            'milestone_tags', Base.metadata,
            Column('milestone_name', ForeignKey('milestone.name')),
            Column('tag_name', ForeignKey('tag.name'))
        )
    )

    @property
    def open_count(self):
        return self.issues.filter(Issue.status == 'open').count()

    @property
    def closed_count(self):
        return self.issues.filter(Issue.status == 'closed').count()

    @property
    def progress(self):
        if self.open_count == 0:
            return 100
        if self.closed_count == 0:
            return 0
        return self.open_count / self.issues.count() * 100

    def update(self, data):
        # Update tag
        self.update_tags(data)

        # Update the remaining attributes.
        super(Milestone, self).update(data)

    def __str__(self):
        return self.name

    def __repr__(self):
        return '<Milestone %r>' % self.name


class Issue(Base, Tagged, Dictionarizable):

    _dictionarizable_attrs = (
        'uid', 'label', 'description', 'level', 'status', 'open_at', 'closed_at', 'updated_at',
        'last_action', 'confirmed', 'reproducible', 'milestone', 'tags', 'attachments', 'author')

    uid = Column(Integer, primary_key=True)
    label = Column(String, nullable=False)
    description = Column(String)
    level = Column(Enum('critical', 'important', 'minor'), default='important')
    status = Column(Enum('open', 'closed'), default='open')
    open_at = Column(UtcDateTime, nullable=False, default=utcnow)
    closed_at = Column(UtcDateTime, default=None)

    confirmed = Column(Boolean, nullable=False, default=False)
    reproducible = Column(Boolean, nullable=False, default=False)

    author_email = Column(String, ForeignKey('user.email'))
    author = relationship('User', backref=backref('issue', lazy='dynamic'))

    milestone_slug = Column(String, ForeignKey('milestone.slug'))
    milestone = relationship('Milestone', backref=backref('issues', lazy='dynamic'))

    tags = relationship(
        'Tag',
        secondary=Table(
            'issue_tags', Base.metadata,
            Column('issue_uid', ForeignKey('issue.uid')),
            Column('tag_name', ForeignKey('tag.name'))
        )
    )

    # Note that on SQLite you must turn on support for foreign keys explicitly
    # or it will just ignore any SQL related to foreign keys. You can achieve
    # this by letting SQLAlchemy emit a PRAGMA statement for new connections.
    # See http://goo.gl/OaWb5i for more information.
    attachments = relationship(
        'Attachment',
        secondary=Table(
            'issue_attachments', Base.metadata,
            Column('issue_uid', ForeignKey('issue.uid', ondelete='CASCADE')),
            Column('attachment_uid', ForeignKey('attachment.uid', ondelete='CASCADE'))
        )
    )

    @property
    def last_action(self):
        if self.closed_at and self.closed_at > self.open_at:
            return 'closed'
        return 'open'

    @property
    def updated_at(self):
        if self.closed_at and self.closed_at > self.open_at:
            return self.closed_at
        return self.open_at

    def update(self, data):
        # Update tags.
        self.update_tags(data)

        # Update the optional attachments.
        if 'attachments' in data:
            attachments = []
            for attachment_uid in data.pop('attachments'):
                try:
                    q = db_session.query(Attachment).filter(Attachment.uid == attachment_uid)
                    attachments.append(q.one())
                except NoResultFound:
                    raise InvalidArgumentError("No such attachment: '%s'." % attachment_uid)
            self.attachments = attachments

        # Update the author of the issue.
        if 'author' in data:
            if data['author']:
                author_email = data.pop('author')
                try:
                    self.author = db_session.query(User).filter(
                        User.email == author_email
                    ).one()
                except NoResultFound:
                    raise InvalidArgumentError("No such user: '%s'." % author_email)
            elif self.author:
                self.author = None

        # Update the milestone the issue is to be assigned to.
        if 'milestone' in data:
            if data['milestone']:
                milestone_slug = data.pop('milestone')
                try:
                    self.milestone = db_session.query(Milestone).filter(
                        Milestone.slug == milestone_slug
                    ).one()
                except NoResultFound:
                    raise InvalidArgumentError("No such milestone: '%s'." % milestone_slug)
            elif self.milestone:
                self.milestone.issues.remove(self)
                del data['milestone']

        # Update the remaining attributes.
        super(Issue, self).update(data)

    def __str__(self):
        return 'Issue #%i' % self.uid

    def __repr__(self):
        return '<Issue %i>' % self.uid


class Attachment(Base, Dictionarizable):

    _dictionarizable_attrs = ('uid', 'name', 'mime_type')

    uid = Column(String, primary_key=True)
    name = Column(String)
    mime_type = Column(String, default='application/octet-stream')
    filename = Column(String)

    def __str__(self):
        return '%s attachment' % self.mime_type

    def __repr__(self):
        return '<Attachment %i>' % self.uid

class Comment (Base, Tagged, Dictionarizable):

    _dictionarizable_attrs = (
        'uid', 'description', 'issues', 'author')

    uid = Column(Integer, primary_key=True)
    description = Column(String)

    author_email = Column(String, ForeignKey('user.email'))
    author = relationship('User', backref=backref('comment', lazy='dynamic'))

    issue_uid = Column(String, ForeignKey('issue.uid'))
    issue = relationship('Issue', backref=backref('comment', lazy='dynamic'))

    def __str__(self):
        return 'Issue #%i' % self.uid

    def __repr__(self):
        return '<Issue %i>' % self.uid
