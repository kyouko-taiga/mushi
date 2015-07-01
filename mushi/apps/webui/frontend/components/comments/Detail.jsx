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

var moment = require('moment');

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var Thumbnail = require('react-bootstrap/lib/Thumbnail');

var marked = require('marked');

var mushi = require('../../common');

var AttachmentGallery = require('../AttachmentGallery');
var CommentModalForm = require('./ModalForm');

var CommentDeleteModal = React.createClass({
    render: function() {
        return (
            <Modal {...this.props}>
                <div className="modal-body">
                    <p>
                        Are you sure you want to delete this comment?
                        This operation cannot be undone.
                    </p>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Cancel</Button>
                    <Button onClick={this.props.handleDelete} bsStyle="danger">Delete</Button>
                </div>
            </Modal>
        );
    }
});

var CommentDetail = React.createClass({
    loadComment: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            cache: false,
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {
            author: null,
            description: null,
            issue: null,
            uid: null,
        };
    },

    componentDidMount: function() {
        this.loadComment();
    },

    handleDelete: function() {
        mushi.api.delete(this.props.endpoint, {
            success: function() {
                Backbone.history.history.back();
            }.bind(this)
        });
    },

    render: function() {
        var description = '';
        if (this.state.description) {
            var raw_markup = marked(this.state.description, {sanitize: true});
            description = <span dangerouslySetInnerHTML={{__html: raw_markup}} />;
        } else {
            description = <i>No description.</i>;
        }

        var issue = (function(issue) {
            if (issue) {
                return <a className="mu-app-link" href={'#issues/' + issue.slug}>{issue.name}</a>;
            } else {
                return '-';
            }
        })(this.state.issue);

        var author = (function(author) {
            if (author) {
                return <a className="mu-app-link" href={'#authors' + author.email}>{author.name}</a>;
            } else {
                return '-';
            }
        })(this.state.author);

        return (
            <article className="mu-component mu-comment-wrapper col-md-12">
                <div className="panel panel-default">
                    <header className="panel-heading clearfix">
                        <div className="pull-left">
                            <h2>#{this.state.uid} {this.state.label}</h2>
                        </div>
                        <div className="pull-right">
                            <div className="mu-button-wrapper">
                                <ModalTrigger modal={<CommentDeleteModal handleDelete={this.handleDelete} title="Are you sure?" />}>
                                    <Button bsStyle='danger'><i className="fa fa-times"></i> Delete</Button>
                                </ModalTrigger>
                                <ModalTrigger modal={<CommentModalForm {...this.state} onModalSubmit={this.handleUpdate} title={'Edit comment #'  + this.state.uid} submitText="Save" submitStyle="success" />}>
                                    <Button bsStyle='warning'><i className="fa fa-pencil"></i> Edit</Button>
                                </ModalTrigger>
                            </div>
                        </div>
                    </header>

                    <div className="panel-body">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="mu-comment-content col-sm-6">
                                    <label>Description</label>
                                    <div className="mu-comment-description">
                                        {description}
                                    </div>
                                </div>
                                <div className="mu-comment-meta col-sm-6">
                                    <dl className="dl-horizontal">
                                        <dt>Issue</dt>        <dd>{issue}</dd>
                                    </dl>
                                    <dl className="dl-horizontal">
                                        <dt>Author</dt>       <dd>{author}</dd>
                                    </dl>
                                </div>
                                <div className="mu-comment-attachments col-sm-12">
                                    <AttachmentGallery
                                        endpoint={mushi.api.root + 'attachments/'}
                                        attachments={this.state.attachments}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    }
});

module.exports = CommentDetail;
