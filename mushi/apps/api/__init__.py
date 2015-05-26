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

from datetime import datetime

from flask import jsonify

from mushi import factory
from mushi.core.exc import AuthenticationError
from mushi.core.utils.time import JSONDatetimeEncoder

from .exc import ApiError


def create_app(debug=False):
    """Returns the Mushi API application instance."""
    app = factory.create_app(__name__, __path__, debug)

    # set the default json encoder
    app.json_encoder = JSONDatetimeEncoder

    # set the error handlers
    app.errorhandler(ApiError)(handle_api_exception)
    app.errorhandler(AuthenticationError)(handle_403)
    app.errorhandler(404)(handle_404)

    @app.route('/')
    def version():
        return jsonify({'version': '0.1'})

    return app


def handle_api_exception(error):
    return jsonify({
        'status': error.status_text,
        'data':   error.data,
        'code':   error.status_code
    }), 400


def handle_403(error):
    return jsonify({'status': 'Access denied.', 'code': 403}), 403


def handle_404(error):
    return jsonify({'status': str(error), 'code': 404}), 404
