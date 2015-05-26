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

from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware

from mushi.apps import api, webui


class Command():

    def __init__(self, argv, **kwargs):
        self.argv = argv

    def __call__(self):
        parser = argparse.ArgumentParser(
            prog=self.argv[0],
            description='Manage the Mushi server.')
        subparsers = parser.add_subparsers(dest='subcommand')
        subparsers.required = True

        # create a sub-parser for the run method
        sub = subparsers.add_parser('run', help='run the server')
        sub.add_argument('-p', '--port', dest='port', action='store', type=int, default=5000,
            help='specify the listening port (default: 5000)')
        sub.add_argument('-o', '--host', dest='host', action='store', default='localhost',
            help='specify the hostname to listen on (default: localhost)')
        sub.add_argument('-d', '--debug', dest='debug', action='store_true',
            help='start the server in debug mode')

        args = parser.parse_args(self.argv[1:])
        if args.subcommand == 'run':
            app = DispatcherMiddleware(
                webui.create_app(debug=args.debug),
                {'/api': api.create_app(debug=args.debug)})
            run_simple(args.host, args.port, app, use_reloader=True, use_debugger=True)
