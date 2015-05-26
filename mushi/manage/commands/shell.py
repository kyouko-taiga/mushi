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

import code

from mushi.factory import create_app


class Command(object):

    def __init__(self, *args, **kwargs):
        pass

    def __call__(self):
        # create an application context
        app = create_app(__name__, [])
        ctx = app.test_request_context()
        ctx.push()

        # set up a dictionary to serve as the environment for the shell
        imported_objects = {}

        # try activating rlcompleter
        try: 
            import readline
        except ImportError:
            pass
        else:
            import rlcompleter
            readline.set_completer(rlcompleter.Completer(imported_objects).complete)
            readline.parse_and_bind("tab:complete")

        code.interact(local=imported_objects)
