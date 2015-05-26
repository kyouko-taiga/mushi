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

from sqlalchemy.types import DateTime, TypeDecorator


class UtcDateTime(TypeDecorator):
    """
    A type decorator that converts any `datetime` to UTC automatically.

    Note that storage of a naive datetime will raise a ValueError.
    See http://stackoverflow.com/questions/2528189
    """

    impl = DateTime

    def process_bind_param(self, value, engine):
        if value is not None:
            return value.astimezone(tz.tzutc())

    def process_result_value(self, value, engine):
        if value is not None:
            return datetime(value.year, value.month, value.day,
                            value.hour, value.minute, value.second,
                            value.microsecond, tzinfo=tz.tzutc())
