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

var Modal = ReactBootstrap.Modal;

var IssueDeleteModal = React.createClass({
    render: function() {
        return (
        <Modal {...this.props}>
          <div className="modal-body">
            <p>
              Are you sure you want to delete this issue? This operation cannot be undone.
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

var Issue = React.createClass({
    loadIssue: function() {
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
        this.loadIssue();
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
        var raw_markup = '';
        if (this.state.description) {
            raw_markup = marked(this.state.description, {sanitize: true});
        }

        var level_label = (function(level) {
            var level_class = 'label';
            if (level == 'critical') {
                level_class += ' label-danger';
            } else if (level == 'important') {
                level_class += ' label-warning';
            } else if (level == 'minor') {
                level_class += ' label-info';
            } else {
                level_class += ' label-default';
            }

            return <span className={level_class}>{level}</span>;
        })(this.state.level);

        var milestone = (function(milestone) {
            if (milestone) {
                return <a href={'#milestones/' + milestone.slug}>{milestone.name}</a>;
            } else {
                return '-';
            }
        })(this.state.milestone);

        var author = (function(author) {
            if (author) {
                return <a href={'#authors' + author.email}>{author.name}</a>;
            } else {
                return '-';
            }
        })(this.state.author);

        var open_at = (function(open_at) {
            return moment(open_at * 1000).format('MMMM Do YYYY');
        })(this.state.open_at);

        var closed_at = (function(closed_at) {
            if (closed_at) {
                return moment(closed_at * 1000).format('MMMM Do YYYY');
            } else {
                return '-';
            }
        })(this.state.closed_at);

        return (
        <article className="mu-component mu-issue-wrapper col-md-12">
          <div className="panel panel-default">
            <header className="panel-heading clearfix">
              <div className="pull-left">
                <h2>
                  #{this.state.uid} {this.state.label}
                </h2>
              </div>
              <div className="pull-right">
                <div className="mu-button-wrapper">
                  <ModalTrigger modal={<IssueDeleteModal handleDelete={this.handleDelete} title="Are you sure?" />}>
                    <Button bsStyle='danger'><i className="fa fa-times"></i> Delete</Button>
                  </ModalTrigger>
                  <ModalTrigger modal={<IssueFormModal {...this.state} onModalSubmit={this.handleUpdate} title={'Edit issue #'  + this.state.uid} submitText="Save" submitStyle="success" />}>
                    <Button bsStyle='warning'><i className="fa fa-pencil"></i> Edit</Button>
                  </ModalTrigger>
                </div>
              </div>
            </header>

            <div className="panel-body">
              <div className="container-fluid">
                <div className="row">
                  <div className="mu-issue-title col-sm-6">
                    <label>Description</label>
                    <div className="mu-issue-description">
                      <span dangerouslySetInnerHTML={{__html: raw_markup}} />
                    </div>
                  </div>
                  <div className="mu-issue-meta col-sm-6">
                    <dl className="dl-horizontal">
                      <dt>Level</dt>        <dd>{level_label}</dd>
                      <dt>Status</dt>       <dd>{this.state.status}</dd>
                      <dt>Milestone</dt>    <dd>{milestone}</dd>
                      <dt>Reproducible</dt> <dd>{this.state.reproducible ? 'yes' : 'no'}</dd>
                    </dl>
                    <dl className="dl-horizontal">
                      <dt>Author</dt>       <dd>{author}</dd>
                      <dt>Open</dt>         <dd>{open_at}</dd>
                      <dt>Closed</dt>       <dd>{closed_at}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
        );
    }
});