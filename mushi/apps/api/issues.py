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

from flask import Blueprint, abort, current_app, jsonify, request

from sqlalchemy.orm.exc import NoResultFound

from werkzeug.exceptions import BadRequest

from mushi.core.auth import require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Issue
from mushi.core.utils.http import jsonify_list
from mushi.core.utils.time import utcnow

from .exc import ApiError
from .filters import parse_filters


bp = Blueprint('issues', __name__)


@bp.route('/issues/')
@require_auth_token
def list_issues(auth_token):
    query = make_issue_list_query()

    rv = [m.to_dict(max_depth=2) for m in query]
    return jsonify_list(rv)


def make_issue_list_query(query_base=None):
    rv = query_base or db_session.query(Issue)

    filters_string = request.args.get('filters')
    if filters_string:
        rv = parse_filters(rv, Issue, filters_string, [Issue.label, Issue.description])

    limit = request.args.get('limit', 20)
    offset = request.args.get('offset', 0)
    rv = rv.order_by(Issue.open_at.desc()).limit(limit).offset(offset)

    return rv


@bp.route('/issues/', methods=['POST'])
@require_auth_token
def create_issue(auth_token):
    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)
    post_data['author'] = auth_token.owner.email

    new_issue = Issue()
    new_issue.update(post_data)

    db_session.add(new_issue)
    db_session.commit()

    return jsonify(new_issue.to_dict(max_depth=2))


@bp.route('/issues/<uid>')
@require_auth_token
def show_issue(auth_token, uid):
    try:
        issue = db_session.query(Issue).filter(Issue.uid == uid).one()
    except NoResultFound:
        abort(404)

    return jsonify(issue.to_dict(max_depth=2))


@bp.route('/issues/<uid>', methods=['POST', 'PUT'])
@require_auth_token
def update_issue(auth_token, uid):
    try:
        issue = db_session.query(Issue).filter(Issue.uid == uid).one()
    except NoResultFound:
        abort(404)

    try:
        post_data = request.get_json(force=True)
    except BadRequest as e:
        raise ApiError(e.description)

    # Update the closing time if the status of the issue gets updated.
    if ('status' in post_data) and post_data['status'] != issue.status:
        if post_data['status'] == 'closed':
            post_data['closed_at'] = utcnow()
        else:
            post_data['closed_at'] = None

    issue.update(post_data)

    db_session.commit()

    return jsonify(issue.to_dict(max_depth=2))


@bp.route('/issues/<uid>', methods=['DELETE'])
@require_auth_token
def delete_issue(auth_token, uid):
    try:
        db_session.query(Issue).filter(Issue.uid == uid).delete()
    except NoResultFound:
        abort(404)

    db_session.commit()

    return '', 204
