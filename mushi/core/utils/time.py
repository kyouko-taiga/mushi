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
from dateutil import tz
from math import floor

from flask.json import JSONEncoder


def utcnow():
    """Returns the current time in a timezone-aware datetime object."""
    return datetime.now(tz=tz.tzutc())


def unix_timestamp(dt):
    """Returns a UNIX timestamp representing the given datetime."""
    try:
        return floor(dt.timestamp())
    except AttributeError:
        # Handle Python 2.
        dt_naive = dt.replace(tzinfo=None) - dt.utcoffset()
        return floor((dt_naive - datetime(1970, 1, 1)).total_seconds())


def from_unix_timestamp(unix_ts):
    """Returns a datetime from the given UNIX timestamp."""
    return datetime.fromtimestamp(int(unix_ts), tz.tzutc())


class JSONDatetimeEncoder(JSONEncoder):

    def default(self, obj):
        if isinstance(obj, datetime):
            return unix_timestamp(obj)
        return JSONEncoder.default(self, obj)
