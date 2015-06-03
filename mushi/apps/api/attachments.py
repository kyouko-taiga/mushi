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

import glob
import mimetypes
import os

from hashlib import md5

from flask import Blueprint, abort, current_app, jsonify, redirect, request, send_file, url_for

from sqlalchemy.orm.exc import NoResultFound

from werkzeug.exceptions import BadRequest

from mushi.core.auth import require_auth_token
from mushi.core.db import db_session
from mushi.core.db.models import Attachment
from mushi.core.utils.http import jsonify_list

from .exc import ApiError
from .filters import parse_filters


bp = Blueprint('attachments', __name__)


def check_file_ext(filename):
    allowed_extensions = current_app.config['ALLOWED_EXTENSIONS']
    return ('.' in filename) and (filename.rsplit('.', 1)[1] in allowed_extensions)


@bp.route('/attachments/')
@require_auth_token
def list_attachments(auth_token):
    query = db_session.query(Attachment)

    filters_string = request.args.get('filters')
    if filters_string:
        query = parse_filters(query, Tag, filters_string, [Tag.name])

    count_only = ('count' in request.args) and (request.args['count'] in ('', '1', 'true'))

    if count_only:
        return jsonify({'count': query.count()})
    else:
        limit = request.args.get('limit', 20)
        offset = request.args.get('offset', 0)
        query = query.limit(limit).offset(offset)

        rv = [m.to_dict(max_depth=2) for m in query]
        return jsonify_list(rv)


@bp.route('/attachments/', methods=['POST', 'PUT'])
@require_auth_token
def create_attachment(auth_token):
    # Check if the file format is valid (solely on its filename).
    file = request.files['file']
    if not (file and check_file_ext(file.filename)):
        raise ApiError('Invalid file format.')

    # Create a file UID based on the file content, so we avoid storing
    # duplicates under different filenames.
    h = md5()
    while True:
        buf = file.read(128)
        if not buf:
            break
        h.update(buf)
    fuid = h.hexdigest()

    # Seek for an existing file reference on the upload.
    attachment = db_session.query(Attachment).filter(Attachment.uid == fuid).first()

    if attachment is None:
        # Create the attachment reference in the database.
        attachment = Attachment()
        attachment.uid = fuid
        attachment.name = file.filename
        attachment.filename = os.path.join(current_app.config['UPLOAD_FOLDER'], fuid)

        file_type, _ = mimetypes.guess_type(file.filename)
        if file_type is not None:
            attachment.mime_type = file_type

        # Save the upload.
        file.seek(0)
        file.save(attachment.filename)

        db_session.add(attachment)
        db_session.commit()

        return_status = 201
    else:
        return_status = 200

    return jsonify(attachment.to_dict(max_depth=2)), return_status


@bp.route('/attachments/<uid>')
@require_auth_token
def show_attachment(auth_token, uid):
    try:
        attachment = db_session.query(Attachment).filter(Attachment.uid == uid).one()
    except NoResultFound:
        abort(404)

    return jsonify(attachment.to_dict(max_depth=2))


@bp.route('/attachments/<uid>', methods=['DELETE'])
@require_auth_token
def delete_attachment(auth_token, uid):
    try:
        attachment = db_session.query(Attachment).filter(Attachment.uid == uid).one()
    except NoResultFound:
        abort(404)

    # Delete the attachment file and its thumbails from the filesystem.
    for filename in glob.glob(attachment.filename + '*'):
        os.remove(filename)

    db_session.delete(attachment)
    db_session.commit()

    return '', 204


@bp.route('/attachments/<uid>/original')
@require_auth_token
def get_attachment_content(auth_token, uid):
    try:
        attachment = db_session.query(Attachment).filter(Attachment.uid == uid).one()
    except NoResultFound:
        abort(404)

    return send_file(attachment.filename, mimetype=attachment.mime_type)


@bp.route('/attachments/<uid>/thumbnail')
@require_auth_token
def get_attachment_thumbnail(auth_token, uid):
    # Return the original content thumbnails aren't enabled.
    if not current_app.config['ENABLE_THUMBAILS']:
        return redirect(url_for('attachments.get_attachment_content', uid=uid))

    from PIL import Image

    try:
        attachment = db_session.query(Attachment).filter(Attachment.uid == uid).one()
    except NoResultFound:
        abort(404)

    size = int(request.args.get('size', 128))
    thumbnail_filename = '%s-%i' % (attachment.filename, size)

    # Only create the thumbnail if it doesn't exists on the filesystem yet.
    if not os.path.isfile(thumbnail_filename):
        im = Image.open(attachment.filename)
        im.thumbnail((size, size))
        im.save(thumbnail_filename, 'png')

    return send_file(thumbnail_filename)
