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

import os

from flask import Flask

from sqlalchemy import create_engine

from .core.db import db_session
from .core.utils.app import register_blueprints


def remove_db_session(exception=None):
    db_session.remove()


def create_app(package_name, package_path, debug=False):
    """Returns a :class:`Flask` application instance.

    :param package_name: application package name
    :param package_path: application package path
    :param debug: the debug flag
    """
    app = Flask(package_name, instance_relative_config=True)

    app.config.from_object('mushi.settings')
    app.config.from_envvar('MUSHI_SETTINGS', silent=True)

    if debug:
        app.debug = debug

    app.db_engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
    app.teardown_appcontext(remove_db_session)

    register_blueprints(app, package_name, package_path)
    return app
