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
import sys

from getpass import getpass
from hashlib import md5

from mushi.core.db import db_session
from mushi.core.db.models import User
from mushi.core.exc import InvalidArgumentError
from mushi.factory import create_app


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        # Create an application context.
        app = create_app(__name__, [])
        ctx = app.test_request_context()
        ctx.push()

        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description="Manage the user's account.")
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        sub = subparsers.add_parser('add', help='add a user')
        sub.add_argument('email', action='store', help="the email of the new user's account")
        sub.add_argument(
            '-n', '--name', dest='name', action='store',
            help='the full name of the user (default: email address)')
        sub.add_argument(
            '-p', '--password', dest='password', action='store',
            help='the full name of the user (will be asked if not provided)')

        sub = subparsers.add_parser('list', help='list users')

        args = parser.parse_args(self.argv[1:])
        if args.subcommand == 'add':
            new_user = User()
            new_user.email = args.email
            new_user.name = args.name or args.email

            if args.password:
                password = args.password
            else:
                password = getpass('password: ')
                if getpass('confirm: ') != password:
                    raise InvalidArgumentError('Password do not match.')
            new_user.password = md5(password.encode()).hexdigest()

            db_session.add(new_user)
            db_session.commit()

        elif args.subcommand == 'list':
            for user in db_session.query(User):
                print('name: {:>15},    email: {:>15}'.format(user.name, user.email))

        ctx.pop()
