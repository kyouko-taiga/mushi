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

import binascii
import os

from datetime import timedelta
from functools import wraps

from flask import current_app, request

from .exc import ExpiredTokenError, InvalidTokenError
from .db import db_session
from .db.models import Token, User
from .utils.time import utcnow


def parse_auth_token():
    """Return the authentication token attached to the request.

    This function tries to retrieve the authentication token attached to the
    request by. It first looks for "X-Auth-Token" in the request headers. If
    no such header could be found, it checks for "Auth-Token" in the request
    cookies.

    If none of these locations contains an authentication token, or the given
    token value doesn't match any existing token, the return value is None.
    """
    token_value = request.headers.get('X-Auth-Token', request.cookies.get('Auth-Token'))
    return db_session.query(Token).filter(Token.value == token_value).first()


def validate_auth_token(token):
    """Check if the given token is valid, unless raises an exception."""
    if token is None:
        raise InvalidTokenError()
    if token.has_expired:
        raise ExpiredTokenError()
    return True


def require_auth_token(f):
    """A decorator that is used on views to ensure that a valid authentication
    token was attached to the request. The decorated function is called with
    the obtained authentication token as an additional argument.

    If the token is missing or invalid, the decorator raises InvalidTokenError
    and does not call the decorated function.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = parse_auth_token()
        validate_auth_token(token)
        kwargs['auth_token'] = token
        return f(*args, **kwargs)
    return wrapper


def make_auth_token(owner):
    """Generates an authentication token for the given owner."""
    new_token = Token()
    new_token.value = binascii.hexlify(os.urandom(32)).decode()
    new_token.expires_at = utcnow() + timedelta(seconds=current_app.config['AUTH_TOKEN_DURATION'])
    new_token.owner = owner
    return new_token
