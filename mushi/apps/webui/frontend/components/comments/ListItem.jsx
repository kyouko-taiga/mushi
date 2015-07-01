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

var mushi = require('../../common');

var CommentListItem = React.createClass({
    getInitialState: function() {
        return this.props;
    },

    render: function() {
        var comment_icon = (function(comment_status) {
            var icon_class = 'fa';
            if (comment_status == 'open') {
                icon_class += ' fa-exclamation-circle';
            } else {
                icon_class += ' fa-check';
            }

            return <i className={icon_class}></i>;
        })(this.state.status);

        var issue = (function(issue) {
            if (issue) {
                return (
                    <span className="mu-comment-meta-item">
                        in <a className="mu-app-link" href={'#issues/' + issue.slug}>{issue.name}</a>
                    </span>
                );
            } else {
                return <span />;
            }
        })(this.state.issue);

        var author = (function(author) {
            if (author) {
                return <span>by <a className="mu-app-link" href={'#authors' + author.email}>{author.name}</a></span>;
            } else {
                return <span />;
            }
        })(this.state.author);

        var comment_action = (function(comment_status) {
            if (comment_status == 'open') {
                return <Button onClick={this.handleClose} bsSize="xsmall">Close</Button>;
            } else {
                return <Button onClick={this.handleOpen}  bsSize="xsmall">Open</Button>;
            }
        }.bind(this))(this.state.status);

        return (
            <div className="mu-list-item clearfix">
                <div className="mu-comment-status">{comment_icon}</div>
                <div className="mu-comment-description">
                    <div className="mu-comment-label">
                        {level_label} <a className="mu-app-link" href={'#comments/' + this.state.uid}>{this.state.label}</a>
                    </div>
                    <div className="mu-comment-meta">
                        <div className="mu-comment-meta-item">
                            #{this.state.uid} {this.state.last_action} {author} {updated_at} {issue}
                        </div>
                        {tags}
                    </div>
                </div>
                <div className="mu-comment-actions">{comment_action}</div>
            </div>
        );
    }
});

module.exports = CommentListItem;
