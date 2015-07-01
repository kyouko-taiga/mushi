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

from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound

from mushi.core.auth import require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Issue, Comment
from mushi.core.utils.http import jsonify_list
from mushi.core.utils.time import utcnow

bp = Blueprint('comments', __name__)


@bp.route('/comments/')
@require_auth_token
def list_comments(auth_token):
    count_only = ('count' in request.args) and (request.args['count'] in ('', '1', 'true'))

    if count_only:
        return jsonify({'count': query.count()})
    else:
        limit = request.args.get('limit', 20)
        offset = request.args.get('offset', 0)
        query = query.order_by(Milestone.due_date).limit(limit).offset(offset)

    rv = [m.to_dict(max_depth=2) for m in query]

    return jsonify_list(rv)


@bp.route('/comments/<uid>')
@require_auth_token
def show_comment(auth_token, uid):
    try:
        comment = db_session.query(Comment).filter(Comment.uid == uid).one()
    except NoResultFound:
        abort(404)

    return jsonify(comment.to_dict(max_depth=2))


@bp.route('/comments/', methods=['POST'])
@require_auth_token
def create_comment(auth_token):
    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)
    post_data['author'] = auth_token.owner.email

    new_comment = Comment()
    new_comment.update(post_data)

    db_session.add(new_comment)
    db_session.commit()

    return jsonify(new_comment.to_dict(max_depth=2))


@bp.route('/comments/<uid>', methods=['POST', 'PUT'])
@require_auth_token
def update_comment(auth_token, uid):
    try:
        comment = db_session.query(Comment).filter(Comment.uid == uid).one()
    except NoResultFound:
        abort(404)

    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)

    post_data['updated_at'] = utcnow()

    comment.update(post_data)

    db_session.commit()

    return jsonify(comment.to_dict(max_depth=2))


@bp.route('/comments/<uid>', methods=['DELETE'])
@require_auth_token
def delete_comment(auth_token, uid):
    try:
        db_session.query(Comment).filter(Comment.uid == uid).delete()
    except NoResultFound:
        abort(404)

    db_session.commit()

    return '', 204
