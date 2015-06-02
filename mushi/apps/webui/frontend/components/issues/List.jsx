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

var ListMixin = require('../ListMixin');

var IssueModalForm = require('./ModalForm');
var IssueListItem = require('./ListItem');

var IssueList = React.createClass({
    mixins: [ListMixin],

    renderList: function() {
        return (
            <div id="mu-issue-list" className="mu-list">
                {this.renderListItems()}
            </div>  
        );
    },

    renderListItems: function() {
        var items = this.state.items.map(function(item) {
            return <IssueListItem key={item.uid} {...item} />;
        });

        if (items.length > 0) {
            return items;
        } else {
            return (
                <div className="alert alert-info" role="alert">
                    <i className="fa fa-info-circle"></i> {"There are no issues matching the criteria."}
                </div>
            );
        }
    },

    renderCreationModalForm: function() {
        return (
            <IssueModalForm
                title="Create a new issue"
                submitText="Create" submitStyle="success"
                hideMilestone={this.props.hideMilestone}
                onModalSubmit={this.handleCreate}
            />
        );
    }
});

var IssueListWrapper = React.createClass({
    render: function() {
        var predefined_filters = [
            {label: "Open", value: "status:open"},
            {label: "Closed", value: "status:closed"},
            "divider",
            {label: "Critical", value: "level:critical"},
            {label: "Important", value: "level:important"},
            {label: "Minor", value: "level:minor"},
        ];

        return (
            <IssueList
                title="Issues"
                predefinedFilters={predefined_filters}
                initialFilters="status:open"
                endpoint={this.props.endpoint}
                limit={this.props.limit}
                pollInterval={this.props.pollInterval || 60}
                hideMilestone={this.props.hideMilestone}
            />
        );
    }
});

module.exports = IssueListWrapper;
