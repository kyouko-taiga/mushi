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

var moment = require('moment');

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');

var marked = require('marked');

var mushi = require('../../common');

var MilestoneModalForm = require('./ModalForm');

var MilestoneDeleteModal = React.createClass({
    render: function() {
        return (
            <Modal {...this.props}>
                <div className="modal-body">
                    <p>
                        Are you sure you want to delete
                        <strong>{this.props.milestoneName}</strong>?
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

var MilestoneDetail = React.createClass({
    loadMilestone: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            cache: false,
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {data: []};
    },

    componentDidMount: function() {
        this.loadMilestone();
    },

    handleUpdate: function(milestone) {
        mushi.api.post(this.props.endpoint, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(milestone),
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
    },

    handleDelete: function() {
        mushi.api.delete(this.props.endpoint, {
            success: function() {
                Backbone.history.history.back();
            }.bind(this)
        });
    },

    render: function() {
        var due_date_item = function() {
            if (this.state.due_date) {
                var due_moment = moment(this.state.due_date * 1000);

                // Add the class 'mu-danger' to the due date span if the
                // milestone is overdue.
                var due_date_class = '';
                if (due_moment - moment() < 0) {
                    due_date_class += ' mu-danger';
                }

                return (
                <small className={due_date_class}>
                  due for {due_moment.format("MMMM Do YYYY")} ({due_moment.fromNow()})
                </small>
                );
            }

            return <small>No due date</small>;
        }.bind(this)

        var raw_markup = '';
        if (this.state.description) {
            raw_markup = marked(this.state.description, {sanitize: true});
        }

        return (
            <article className="mu-component mu-milestone-wrapper col-md-12">
                <div className="panel panel-default">
                    <header className="panel-heading clearfix">
                        <div className="pull-left">
                            <h2>{this.state.name} {due_date_item()}</h2>
                        </div>
                        <div className="pull-right">
                            <div className="mu-button-wrapper">
                                <ModalTrigger modal={<MilestoneDeleteModal milestoneName={this.state.name} handleDelete={this.handleDelete} title="Are you sure?" />}>
                                    <Button bsStyle='danger'><i className="fa fa-times"></i> Delete</Button>
                                </ModalTrigger>
                                <ModalTrigger modal={<MilestoneModalForm {...this.state} onModalSubmit={this.handleUpdate} title={'Edit" '  + this.state.name + '"'} submitText="Save" submitStyle="success" />}>
                                    <Button bsStyle='warning'><i className="fa fa-pencil"></i> Edit</Button>
                                </ModalTrigger>
                            </div>
                        </div>
                    </header>

                    <div className="panel-body">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="mu-milestone-title col-sm-6">
                                    <label>Description</label>
                                    <div className="mu-milestone-description">
                                        <span dangerouslySetInnerHTML={{__html: raw_markup}} />
                                    </div>
                                </div>
                                <div className="mu-milestone-progress col-sm-6">
                                    <label>Progress</label>
                                    <div className="mu-milestone-progress-bar">
                                        <div className="progress">
                                            <div
                                                className="progress-bar progress-bar-success" role="progressbar"
                                                style={{width: this.state.progress + '%'}}
                                                aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100"
                                                >
                                                <span className="sr-only">{this.state.progress}% Complete</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mu-milestone-progress-meta">
                                            {this.state.progress}% ({this.state.open_count} open and {this.state.closed_count})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        );
    }
});

module.exports = MilestoneDetail;
