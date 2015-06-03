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


basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

# Development settings: OVERRIDE THIS IN PRODUCTION!
SEND_FILE_MAX_AGE_DEFAULT = 0

# Root urls
API_ROOT = 'http://localhost:5000/api/'

# SQLAlchemy
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'data', 'mushi.dev.db')

# Authentication
AUTH_TOKEN_DURATION = 86400

# File handling
UPLOAD_FOLDER = os.path.join(basedir, 'data', 'attachments')
MAX_CONTENT_LENGTH = 1073741824
ALLOWED_EXTENSIONS = set(['pdf', 'png', 'jpg', 'jpeg', 'gif'])

# Thumbnails
ENABLE_THUMBAILS = False
