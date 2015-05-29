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

import logging
import os
import site
import sys

# Add the path to the site-packages of your installation. Typically, if you use
# virtual environments, you may enter the path to its site-packages directory
# in this list (ex: /path/to/virtualenv/lib/python3.x/site-packages/).
SITE_PACKAGES = []

# Set here the path to the mushi package. Typically, it is the path to the
# the directory this file is in.
APP_PATH = '/path/to/mushi/'

# Remember original sys.path.
old_syspath = list(sys.path)

# Add each additional site-packages directory.
for sp in SITE_PACKAGES:
    site.addsitedir(sp)

# Reorder sys.path to place new directories at the front.
new_syspath = []
for item in list(sys.path):
    if item not in old_syspath:
        new_syspath.append(item)
        sys.path.remove(item)
sys.path[:0] = new_syspath

# Insert application path.
sys.path.insert(0, APP_PATH)

# Redirect logging to sys.stderr.
logging.basicConfig(stream=sys.stderr)

from werkzeug.serving import run_simple
from werkzeug.wsgi import DispatcherMiddleware

from mushi.apps import api, webui


def application(req_environ, start_response):
    os.environ['MUSHI_SETTINGS'] = req_environ['MUSHI_SETTINGS']

    fn = DispatcherMiddleware(
        webui.create_app(),
        {
            '/api': api.create_app()
        }
    )

    return fn(req_environ, start_response)


if __name__ == '__main__':
    run_simple('0.0.0.0', 5000, application, use_reloader=True, use_debugger=True)
