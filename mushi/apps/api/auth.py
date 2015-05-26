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

from hashlib import md5

from flask import Blueprint, abort, jsonify, request

from sqlalchemy.orm.exc import NoResultFound

from mushi.core.auth import make_auth_token, require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Token, User
from mushi.core.utils.http import jsonify_list
from mushi.core.utils.time import unix_timestamp


bp = Blueprint('auth', __name__)


@bp.route('/users/')
@require_auth_token
def list_user(auth_token):
    limit = request.args.get('limit')
    offset = request.args.get('offset')

    query = db_session.query(User)
    if limit is not None:
        query = query.limit(limit)
    if offset is not None:
        query = query.offset(offset)

    rv = [m.to_dict(max_depth=2) for m in query]
    return jsonify_list(rv)


@bp.route('/users/', methods=['POST'])
@require_auth_token
def create_user(auth_token):
    post_data = request.get_json(force=True)
    post_data['password'] = md5(post_data['password'].encode()).hexdigest()

    new_user = User()
    new_tag.update(post_data)

    db_session.add(new_user)
    db_session.commit()

    return jsonify(new_user.to_dict(max_depth=2))


@bp.route('/users/<email>')
@require_auth_token
def show_user(auth_token, email):
    if email == 'me':
        user = auth_token.owner
    else:
        try:
            user = db_session.query(User).filter(User.email == email).one()
        except NoResultFound:
            abort(404)

    return jsonify(user.to_dict(max_depth=2))


@bp.route('/users/<email>', methods=['POST', 'PUT'])
@require_auth_token
def update_user(auth_token, email):
    if email == 'me':
        user = auth_token.owner
    else:
        try:
            user = db_session.query(User).filter(User.email == email).one()
        except NoResultFound:
            abort(404)

    post_data = request.get_json(force=True)
    post_data['password'] = md5(post_data['password'].encode()).hexdigest()
    user.update(post_data)

    db_session.commit()

    return jsonify(user.to_dict(max_depth=2))


@bp.route('/users/<email>', methods=['DELETE'])
@require_auth_token
def delete_user(auth_token, email):
    if email == 'me':
        user = auth_token.owner
    else:
        try:
            user = db_session.query(User).filter(User.email == email).one()
        except NoResultFound:
            abort(404)

    db_session.delete(user)
    db_session.commit()

    return '', 204


@bp.route('/tokens/', methods=['POST'])
def authenticate():
    post_data = request.get_json(force=True)

    # get the credentials
    email = post_data.get('email')
    password = md5(post_data.get('password', '').encode()).hexdigest()

    # search for the user identified by email/password
    user = db_session.query(User).filter(
        User.email == email,
        User.password == password
    ).first()

    if user is None:
        abort(403)

    # generate a new token for the authenticated user
    token = make_auth_token(user)
    db_session.add(token)
    db_session.commit()

    return jsonify(token.to_dict()), 201


@bp.route('/tokens/<token_value>', methods=['DELETE'])
@require_auth_token
def delete_token(auth_token, token_value):
    """Revoke the given authentication token."""
    db_session.query(Token).filter(
        Token.owner == auth_token.owner,
        Token.value == token_value
    ).delete(synchronize_session='fetch')
    db_session.commit()
    return '', 204
