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

from flask import render_template

from mushi import factory
from mushi.core.exc import InvalidTokenError
from mushi.core.auth import parse_auth_token


def create_app(debug=False):
    """Returns the mikata API application instance."""
    app = factory.create_app(__name__, __path__, debug)

    def inject_auth_user():
        token = parse_auth_token()
        if token is None:
            return {}
        return {'auth_user': token.owner}

    app.context_processor(inject_auth_user)

    app.errorhandler(403)(handle_403)
    app.errorhandler(InvalidTokenError)(handle_403)

    app.errorhandler(404)(handle_404)

    return app


def handle_403(error):
    return render_template('errors/403.html')


def handle_404(error):
    return render_template('errors/404.html')
