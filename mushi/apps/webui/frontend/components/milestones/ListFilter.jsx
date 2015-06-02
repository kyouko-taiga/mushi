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

var MilestoneListFilterItem = React.createClass({
    handleClick: function(e) {
        e.preventDefault();
        this.props.onSelect(this.props.value);
    },

    render: function() {
        return <li><a href="#" onClick={this.handleClick}>{this.props.label}</a></li>;
    }
});

var MilestoneListFilter = React.createClass({
    getInitialState: function() {
        return {
            value: this.props.value,
        };
    },

    componentDidMount: function() {
        $(document.body).on('keydown', this.handleKeyDown);
    },

    componentWillUnmount: function() {
        $(document.body).off('keydown', this.handleKeyDown);
    },

    handleDropdown: function(value) {
        this.setState(
            {value: value},
            function() {
                this.props.onFiltersChange(value);
            }
        );
    },

    handleChange: function(e) {
        this.setState({value: e.target.value});
    },

    handleKeyDown: function(e) {
        if (e.keyCode == 13) {
            this.props.onFiltersChange(this.state.value);
        }
    },

    render: function() {
        return (
            <div className="input-group">
                <div className="input-group-btn">
                    <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                        <i className="fa fa-search"></i> <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu" role="menu">
                        <MilestoneListFilterItem onSelect={this.handleDropdown} value="status:open" label="Open" />
                        <MilestoneListFilterItem onSelect={this.handleDropdown} value="status:closed" label="Closed" />
                    </ul>
                </div>
                <input
                    type="search" className="form-control" placeholder="Filter results"
                    value={this.state.value} onChange={this.handleChange}
                    aria-label="Filter results"
                />
            </div>
        );
    }
});

module.exports = MilestoneListFilter;
