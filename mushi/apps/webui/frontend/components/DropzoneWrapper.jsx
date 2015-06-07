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

var React = require('react');

var Button = require('react-bootstrap').Button;
var ProgressBar = require('react-bootstrap').ProgressBar;

var Dropzone = require('react-dropzone');

var mushi = require('../common');

var LocalThumbnail = React.createClass({
    propTypes: {
        file: React.PropTypes.object.isRequired,
        index: React.PropTypes.number,
        onDelete: React.PropTypes.func
    },

    getInitialState: function() {
        return {
            uid: null,
            progress: 0,
            upload_status: 'unsent'
        };
    },

    componentDidMount: function() {
        var xhr = new XMLHttpRequest();

        // Attach a listener on the request handler to handle its completion.
        xhr.onreadystatechange = function() {
            // We are only to handle the request completion, so we ignore all
            // other ready states.
            if (xhr.readyState == 4) {
                var response = null;
                try {
                    // Try to parse the xhr response as a JSON object.
                    response = JSON.parse(xhr.responseText);
                } catch(e) {
                    // Catch non-JSON reponses.
                    response = {
                        status: xhr.statusText,
                        code: xhr.status
                    };
                }

                if (xhr.status == 200 || xhr.status == 201) {
                    // Update the upload status and store the thumbnail UID.
                    this.setState({
                        uid: response.uid,
                        upload_status: 'done'
                    });
                } else {
                    // Report the error sent by the server.
                    mushi.alert(response.status + ' (' + response.code + ')');
                    this.setState({upload_status: 'failed'});
                }
            }
        }.bind(this);

        // Attach a listener on the request to handle progress update.
        xhr.upload.onprogress = function(e) {
            this.setState({progress: (e.loaded / e.total) * 100});
        }.bind(this);

        // Add the file handler to the request data.
        var form_data = new FormData();
        form_data.append('file', this.props.file);

        // Send the request.
        xhr.open('POST', mushi.api.root + 'attachments/');
        xhr.send(form_data);
        this.setState({upload_status: 'loading'});
    },

    handleDelete: function() {
        this.props.onDelete(this.props.index);
    },

    getUID: function() {
        return this.state.uid;
    },

    render: function() {
        var preview_style = {backgroundImage: 'url(' + this.props.file.preview + ')'};

        return (
            <div className="mu-thumbnail">
                <div className="mu-preview" style={preview_style}></div>
                <div className="mu-caption">
                    {this.props.file.name}
                </div>
                {this.renderUploadStatus()}
                {this.renderCornerButton()}
            </div>
        );
    },

    renderUploadStatus: function() {
        if (this.state.upload_status == 'loading') {
            return (
                <div className="mu-progress">
                    <ProgressBar now={this.state.progress} />
                </div>
            );
        } else if (this.state.upload_status == 'failed') {
            return (
                <div className="mu-status">
                    <i className="fa fa-exclamation-circle"></i>
                </div>
            );
        }
    },

    renderCornerButton: function() {
        if ((this.state.upload_status == 'done') || (this.state.upload_status == 'failed')) {
            return (
                <div className="mu-thumbnail-btn">
                    <Button bsStyle="danger" onClick={this.handleDelete}>
                        <i className="fa fa-times"></i>
                    </Button>
                </div>
            );
        } else {
            return <div />;
        }
    }
});

var ServerThumbnail = React.createClass({
    propTypes: {
        uid: React.PropTypes.node.isRequired,
        name: React.PropTypes.string,
        index: React.PropTypes.number,
        onDelete: React.PropTypes.func
    },

    handleDelete: function() {
        this.props.onDelete(this.props.index);
    },

    getUID: function() {
        return this.props.uid;
    },

    render: function() {
        var url = mushi.api.root + 'attachments/' + this.props.uid + '/thumbnail';
        var preview_style = {backgroundImage: 'url(' + url + ')'};

        return (
            <div className="mu-thumbnail">
                <div className="mu-preview" style={preview_style}></div>
                <div className="mu-caption">
                    {this.props.name}
                </div>
                <div className="mu-thumbnail-btn">
                    <Button bsStyle="danger" onClick={this.handleDelete}>
                        <i className="fa fa-times"></i>
                    </Button>
                </div>
            </div>
        );
    }
});

var DropzoneWrapper = React.createClass({
    propTypes: {
        value: React.PropTypes.array
    },

    getInitialState: function() {
         return {
            thumbnails: (this.props.value || []).map(function(uid) {
                return {uid: uid, file: null};
            })
        }
    },

    handleDrop: function(files) {
        var new_thumbs = files.map(function(file) {
            return {uid: null, file: file};
        });
        this.setState({thumbnails: this.state.thumbnails.concat(new_thumbs)});
    },

    handleThumbailDelete: function(index) {
        this.state.thumbnails.splice(index, 1);
        this.forceUpdate();
    },

    getValue: function() {
        var rv = [];
        for (var i = 0; i < this.state.thumbnails.length; ++i) {
            var uid = this.refs['thumb-' + i].getUID();
            if (uid != null) {
                rv.push(uid);
            }
        }
        return rv;
    },

    render: function() {
        var thumbnails = this.state.thumbnails.map(function(thumb, index) {
            if (thumb.file != null) {
                return (
                    <LocalThumbnail
                        file={thumb.file} index={index} ref={'thumb-' + index} key={index}
                        onDelete={this.handleThumbailDelete}
                    />
                );
            } else {
                return (
                    <ServerThumbnail
                        uid={thumb.uid} name={thumb.name}
                        index={index} ref={'thumb-' + index} key={index}
                        onDelete={this.handleThumbailDelete}
                    />
                );
            }
        }.bind(this));

        return (
            <div className="mu-dropzone-wrapper col-md-12">
                {thumbnails}
                <div className="mu-thumbnail">
                    <Dropzone className="mu-dropzone" style={{}} onDrop={this.handleDrop}>
                        <div className="mu-dropzone-icon">
                            <i className="fa fa-arrow-down"></i>
                        </div>
                        Click or drop your files here to upload
                    </Dropzone>
                </div>
            </div>
        );
    }
});

module.exports = DropzoneWrapper;