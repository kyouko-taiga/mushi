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

import argparse

from mushi.core.db import db_sync
from mushi.factory import create_app


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        # create an application context
        app = create_app(__name__, [])
        ctx = app.test_request_context()
        ctx.push()

        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description='Manage the database of Mikata.')
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        subparsers.add_parser('sync', help='synchronize the database')

        args = parser.parse_args(self.argv[1:])
        if args.subcommand == 'sync':
            db_sync()

        ctx.pop()
