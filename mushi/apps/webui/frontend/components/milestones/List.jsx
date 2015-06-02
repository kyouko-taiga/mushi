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

var MilestoneModalForm = require('./ModalForm');
var MilestoneListItem = require('./ListItem');

var MilestoneList = React.createClass({
    mixins: [ListMixin],

    renderList: function() {
        return (
            <div id="mu-milestone-list" className="mu-list">
                {this.renderListItems()}
            </div>  
        );
    },

    renderListItems: function() {
        var items = this.state.items.map(function(item) {
            return <MilestoneListItem key={item.slug} {...item} />;
        });

        if (items.length > 0) {
            return items;
        } else {
            return (
                <div className="alert alert-info" role="alert">
                  <i className="fa fa-info-circle"></i> {"There are no milestones matching the criteria."}
                </div>
            );
        }
    },

    renderCreationModalForm: function() {
        return (
            <MilestoneModalForm
                title="Create a new milestone"
                submitText="Create" submitStyle="success"
                onModalSubmit={this.handleCreate}
            />
        );
    }
});

var MilestoneListWrapper = React.createClass({
    render: function() {
        var predefined_filters = [
            {label: "Open", value: "status:open"},
            {label: "Closed", value: "status:closed"},
        ];

        return (
            <MilestoneList
                title="Milestones"
                predefinedFilters={predefined_filters}
                endpoint={this.props.endpoint}
                limit={this.props.limit}
                pollInterval={this.props.pollInterval || 60}
            />
        );
    }
});

module.exports = MilestoneListWrapper;
