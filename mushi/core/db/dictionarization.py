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

from collections.abc import Mapping, Set, Sequence


class Dictionarizable(object):

    @classmethod
    def dictionarizable_attrs(cls):
        rv = set(cls._dictionarizable_attrs) if hasattr(cls, '_dictionarizable_attrs') else set()
        for base in cls.__bases__:
            if hasattr(base, 'dictionarizable_attrs'):
                rv.update(base.dictionarizable_attrs())
        return rv

    def to_dict(self, max_depth=1):
        return dictionarize(self, max_depth)


def dictionarize(model, max_depth=1):
    rv = {}

    # Return "as is" the objects that aren't database models, or don't inherit
    # from dictionarizable.
    if not (isinstance(model, Dictionarizable) and hasattr(model, '__mapper__')):
        return model

    # Don't unfold models beyond max_depth.
    if max_depth <= 0:
        return {c.name: getattr(model, c.key) for c in model.__mapper__.primary_key}
    max_depth -= 1

    # Loop through the columns attributes.
    fields = ((f, getattr(model, f)) for f in model.dictionarizable_attrs())

    for key, value in fields:
        if isinstance(value, Mapping):
            rv[key] = {k: dictionarize(v, max_depth) for k, v in value.items()}
        elif isinstance(value, (Set, Sequence)) and not isinstance(value, str):
            rv[key] = list(dictionarize(v, max_depth) for v in value)
        else:
            rv[key] = dictionarize(value, max_depth)

    return rv
