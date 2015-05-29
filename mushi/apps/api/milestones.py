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

import re
import unicodedata

from flask import Blueprint, abort, jsonify, request

from sqlalchemy.orm.exc import NoResultFound

from werkzeug.exceptions import BadRequest

from mushi.core.auth import require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Milestone
from mushi.core.utils.http import jsonify_list
from mushi.core.utils.time import from_unix_timestamp

from .exc import ApiError
from .filters import parse_filters


bp = Blueprint('milestones', __name__)


@bp.route('/milestones/')
@require_auth_token
def list_milestones(auth_token):
    query = db_session.query(Milestone)

    filters_string = request.args.get('filters')
    if filters_string:
        query = parse_filters(
            query, Milestone, filters_string, [Milestone.name, Milestone.description])

    limit = request.args.get('limit', 20)
    offset = request.args.get('offset', 0)
    query = query.order_by(Milestone.due_date).limit(limit).offset(offset)

    rv = [m.to_dict(max_depth=2) for m in query]
    return jsonify_list(rv)


@bp.route('/milestones/', methods=['POST'])
@require_auth_token
def create_milestone(auth_token):
    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)
    if 'due_date' in post_data:
        post_data['due_date'] = from_unix_timestamp(post_data['due_date'])

    new_milestone = Milestone()
    new_milestone.update(post_data)

    db_session.add(new_milestone)
    db_session.commit()

    return jsonify(new_milestone.to_dict(max_depth=2))


@bp.route('/milestones/<slug>')
@require_auth_token
def show_milestone(auth_token, slug):
    try:
        milestone = db_session.query(Milestone).filter(Milestone.slug == slug).one()
    except NoResultFound:
        abort(404)

    return jsonify(milestone.to_dict(max_depth=2))


@bp.route('/milestones/<slug>', methods=['POST', 'PUT'])
@require_auth_token
def update_milestone(auth_token, slug):
    try:
        milestone = db_session.query(Milestone).filter(Milestone.slug == slug).one()
    except NoResultFound:
        abort(404)

    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)
    if 'due_date' in post_data:
        post_data['due_date'] = from_unix_timestamp(post_data['due_date'])

    milestone.update(post_data)

    db_session.commit()

    return jsonify(milestone.to_dict(max_depth=2))


@bp.route('/milestones/<slug>', methods=['DELETE'])
@require_auth_token
def delete_milestone(auth_token, slug):
    try:
        db_session.query(Milestone).filter(Milestone.slug == slug).delete()
    except NoResultFound:
        abort(404)

    db_session.commit()

    return '', 204
