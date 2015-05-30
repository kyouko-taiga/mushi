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

var Button = ReactBootstrap.Button;

var IssueListItem = React.createClass({
    getInitialState: function() {
        return this.props;
    },

    handleClose: function(e) {
        mushi.api.post('issues/' + this.props.uid, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({'status': 'closed'}),
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
    },

    handleOpen: function(e) {
        mushi.api.post('issues/' + this.props.uid, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({'status': 'open'}),
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
    },

    render: function() {
        var issue_icon = (function(issue_status) {
            var icon_class = 'fa';
            if (issue_status == 'open') {
                icon_class += ' fa-exclamation-circle';
            } else {
                icon_class += ' fa-check';
            }

            return <i className={icon_class}></i>;
        })(this.state.status);

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
                return (
                <span className="mu-issue-meta-item">
                  in <a className="mu-app-link" href={'#milestones/' + milestone.slug}>{milestone.name}</a>
                </span>  
                );
            } else {
                return <span />;
            }
        })(this.state.milestone);

        var author = (function(author) {
            if (author) {
                return <span>by <a className="mu-app-link" href={'#authors' + author.email}>{author.name}</a></span>;
            } else {
                return <span />;
            }
        })(this.state.author);

        var updated_at = (function(updated_at) {
            return <span>{moment(updated_at * 1000).fromNow()}</span>;
        })(this.state.updated_at);

        var tags = (function(tags) {
            var items = tags.map(function(item) {
                return <a className="mu-app-link" href={'#tags/' + item.name}>{item.name}</a>;
            });

            if (items.length > 0) {
                return (
                <div className="mu-issue-meta-item">
                  <i className="fa fa-tag"></i> {items}
                </div>  
                );
            } else {
                return <div className="mu-issue-meta-item" />;
            }
        })(this.state.tags);

        var issue_action = (function(issue_status) {
            if (issue_status == 'open') {
                return <Button onClick={this.handleClose} bsSize="xsmall">Close</Button>;
            } else {
                return <Button onClick={this.handleOpen}  bsSize="xsmall">Open</Button>;
            }
        }.bind(this))(this.state.status);

        return (
        <div className="mu-list-item clearfix">
          <div className="mu-issue-status">{issue_icon}</div>
          <div className="mu-issue-description">
            <div className="mu-issue-label">
              {level_label} <a className="mu-app-link" href={'#issues/' + this.state.uid}>{this.state.label}</a>
            </div>
            <div className="mu-issue-meta">
              <div className="mu-issue-meta-item">
                #{this.state.uid} {this.state.last_action} {author} {updated_at} {milestone}
              </div>
              {tags}
            </div>
          </div>
          <div className="mu-issue-actions">{issue_action}</div>
        </div>
        );
    }
});