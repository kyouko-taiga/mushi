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

from flask import Blueprint, current_app, redirect, render_template, url_for

from mushi.core.auth import parse_auth_token, require_auth_token, validate_auth_token
from mushi.core.exc import AuthenticationError

bp = Blueprint('views', __name__)


@bp.route('/')
@require_auth_token
def index(auth_token):
    return render_template('spa.html', api_root=current_app.config['API_ROOT'])


@bp.route('/login')
def login():
    try:
        auth_token = parse_auth_token()
        validate_auth_token(auth_token)
        return redirect(url_for('views.index'))
    except AuthenticationError:
        return render_template('login.html', api_root=current_app.config['API_ROOT'])
