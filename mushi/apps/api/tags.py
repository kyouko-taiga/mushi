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

from flask import Blueprint, abort, jsonify, request

from sqlalchemy.orm.exc import NoResultFound

from werkzeug.exceptions import BadRequest

from mushi.core.auth import require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Tag
from mushi.core.utils.http import jsonify_list

from .exc import ApiError


bp = Blueprint('tags', __name__)


@bp.route('/tags/')
@require_auth_token
def list_tags(auth_token):
    limit = request.args.get('limit')
    offset = request.args.get('offset')

    query = db_session.query(Tag)
    if limit is not None:
        query = query.limit(limit)
    if offset is not None:
        query = query.offset(offset)

    rv = [m.to_dict(max_depth=2) for m in query]
    return jsonify_list(rv)


@bp.route('/tags/', methods=['POST'])
@require_auth_token
def create_tag(auth_token):
    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)

    new_tag = Tag()
    new_tag.update(post_data)

    db_session.add(new_tag)
    db_session.commit()

    return jsonify(new_tag.to_dict(max_depth=2))


@bp.route('/tags/<name>')
@require_auth_token
def show_tag(auth_token, name):
    try:
        tag = db_session.query(Tag).filter(Tag.name == name).one()
    except NoResultFound:
        abort(404)

    return jsonify(tag.to_dict(max_depth=2))


@bp.route('/tags/<name>', methods=['POST', 'PUT'])
@require_auth_token
def update_tag(auth_token, name):
    try:
        tag = db_session.query(Tag).filter(Tag.name == name).one()
    except NoResultFound:
        abort(404)

    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)

    tag.update(post_data)

    db_session.commit()

    return jsonify(tag.to_dict(max_depth=2))


@bp.route('/tags/<name>', methods=['DELETE'])
@require_auth_token
def delete_tag(auth_token, name):
    try:
        db_session.query(Tag).filter(Tag.name == name).delete()
    except NoResultFound:
        abort(404)

    db_session.commit()

    return '', 204
