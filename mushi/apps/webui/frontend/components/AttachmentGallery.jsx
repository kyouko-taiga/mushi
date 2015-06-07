/* Copyright 2015 Dimitri Racordon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var $ = require('jquery');

var React = require('react');

var mushi = require('../common');

var AttachmentThumbnail = React.createClass({
    isImage: function() {
        return (this.props.mime_type || '').split('/')[0] == 'image';
    },

    handleClick: function(e) {
        e.preventDefault();
        this.props.onShow(this.props.index);
    },

    render: function() {
        if (this.isImage()) {
            var preview_style = {backgroundImage: 'url(' + this.props.endpoint + '/thumbnail)'};
        } else {
            var preview_style = null;
        }

        return (
            <div className="mu-thumbnail">
                <a href={this.props.endpoint + '/original'} onClick={this.handleClick}>
                    <div className="mu-preview" style={preview_style}>
                        {this.renderPreviewIcon()}
                    </div>
                    <div className="mu-caption">
                        {this.props.name}
                    </div>
                </a>
            </div>
        );
    },

    renderPreviewIcon: function() {
        // Get top-level type and subtype name.
        var mime_type = this.props.mime_type.split('/');

        // Return the corresponding icon.
        if (mime_type[0] == 'image') {
            return null;
        } else if(mime_type[1] == 'pdf') {
            return <i className="fa fa-file-pdf-o"></i>;
        } else {
            return <i className="fa fa-file-o"></i>;
        }
    }
});

var AttachmentGallery = React.createClass({
    render: function() { 
        return (
            <div className="mu-gallery">
                {this.renderThumbnails()}
            </div>
        );
    },

    showAttachment: function(index) {
        $.magnificPopup.open({
            items: this.props.attachments.map(function(it) {
                var is_image = (it.mime_type || '').split('/')[0] == 'image';
                return {
                    src: this.props.endpoint + it.uid + '/original',
                    type: is_image ? 'image' : 'iframe'
                };
            }.bind(this)),
            gallery: {
                enabled: true
            }
        }, index);
    },

    renderThumbnails: function() {
        return this.props.attachments.map(function(it, index) {
            var ep = this.props.endpoint + it.uid;
            return (
                <AttachmentThumbnail
                    {...it}
                    endpoint={ep} index={index} key={it.uid}
                    onShow={this.showAttachment}
                />
            );
        }.bind(this));
    }
});

module.exports = AttachmentGallery;
