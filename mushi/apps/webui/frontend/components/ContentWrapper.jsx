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

var DashboardPage = require('./DashboardPage');
var MilestoneListPage = require('./milestones/ListPage');
var MilestoneDetailPage = require('./milestones/DetailPage');
var IssueListPage = require('./issues/ListPage');
var IssueDetailPage = require('./issues/DetailPage');
var SettingsPage = require('./settings/Page');

var ContentWrapper = React.createClass({
    componentWillMount : function() {
        this.callback = (function() {
            this.forceUpdate();
        }).bind(this);

        this.props.router.on('route', this.callback);
    },

    componentWillUnmount : function() {
        this.props.router.off('route', this.callback);
    },

    render : function() {
        if (this.props.router.current == 'dashboard') {
            return <DashboardPage router={this.props.router} />;
        }
        if (this.props.router.current == 'milestones') {
            return <MilestoneListPage router={this.props.router} />;
        }
        if (this.props.router.current == 'milestone_detail') {
            return <MilestoneDetailPage router={this.props.router} />;
        }
        if (this.props.router.current == 'issues') {
            return <IssueListPage router={this.props.router} />;
        }
        if (this.props.router.current == 'issue_detail') {
            return <IssueDetailPage router={this.props.router} />;
        }
        if (this.props.router.current == 'settings') {
            return <SettingsPage router={this.props.router} />;
        }
        return <div />;
    }
});

module.exports = ContentWrapper;
