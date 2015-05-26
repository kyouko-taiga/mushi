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

from mushi.core.exc import MushiError


class ApiError(MushiError):

    def __init__(self, status_text, status_code=400, data=None):
        Exception.__init__(self)
        self.status_text = status_text
        self.status_code = status_code
        self.data = data

    def __str__(self):
        return self.status_text

    def __repr__(self):
        return '<%s %i>' % (self.__class__.__name__, self.status_code)
