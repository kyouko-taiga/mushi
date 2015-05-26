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

from sqlalchemy import or_

from .exc import ApiError


def parse_filters(query, model_class, filters_string, haystacks=None):
    rv = query
    is_formatted_filter = True

    filters = []
    for token in filters_string.split():
        try:
            attr, value = token.split(':')
            if value == 'null':
                value = None
            filters.append((attr, value))
        except ValueError:
            is_formatted_filter = False
            break

    if is_formatted_filter:
        for attr, value in filters:
            try:
                rv = rv.filter(getattr(model_class, attr) == value)
            except AttributeError as e:
                raise ApiError(str(e))
    elif haystacks:
        needle = '%{0}%'.format(filters_string)
        filters = map(lambda attr: attr.ilike(needle), haystacks)
        rv = rv.filter(or_(*filters))

    return rv
