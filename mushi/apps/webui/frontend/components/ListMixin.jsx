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

var Button = require('react-bootstrap/lib/Button');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');

var mushi = require('../common');

var ListFilter = require('./ListFilter');
var Pager = require('./Pager');
var SetIntervalMixin = require('./Mixins').SetIntervalMixin;

var ListMixin = {
    mixins: [SetIntervalMixin],

    propTypes: {
        title: React.PropTypes.string,
        endpoint: React.PropTypes.string,
        limit: React.PropTypes.number,
        predefinedFilters: React.PropTypes.array,
        initialFilters: React.PropTypes.string,
        pollInterval: React.PropTypes.number
    },

    getInitialState: function() {
        return {
            items: [],
            filters: this.props.initialFilters,
            offset: 0,
            count: 0
        };
    },

    getItemCount: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            data: {
                filters: this.state.filters,
                count: true
            },
            cache: false,
            success: function(response) {
                this.setState({count: response.count});
            }.bind(this)
        });
    },

    loadItems: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            data: {
                filters: this.state.filters,
                limit: this.props.limit,
                offset: this.state.offset
            },
            cache: false,
            success: function(response) {
                this.setState({items: response});
            }.bind(this)
        });
    },

    componentDidMount: function() {
        this.getItemCount();
        this.loadItems();

        this.setInterval(this.getItemCount, this.props.pollInterval);
        this.setInterval(this.loadItems, this.props.pollInterval);
    },

    handleFiltersChange: function(filters_value) {
        this.state.filters = filters_value;
        this.loadItems();
    },

    handlePaginate: function(page) {
        this.setState({offset: page * this.props.limit}, function() {
            this.loadItems();
        });
    },

    handleCreate: function(new_item) {
        mushi.api.post(this.props.endpoint, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(new_item),
            success: function(response) {
                this.setState({items: [response].concat(this.state.items)});
            }.bind(this)
        });
    },

    render: function() {
        return(
            <article className="mu-component mu-list-wrapper col-md-12">
                <div className="panel panel-default">
                    <header className="panel-heading clearfix">
                        <div className="pull-left">
                            <h2><i className="fa fa-exclamation-circle"></i> {this.props.title}</h2>
                        </div>
                        <div className="pull-right">
                            <span className="mu-filter-wrapper">
                                <ListFilter
                                    predefinedFilters={this.props.predefinedFilters}
                                    value={this.state.filters}
                                    onFiltersChange={this.handleFiltersChange}
                                />
                            </span>
                            <span className="mu-button-wrapper">
                                <ModalTrigger modal={this.renderCreationModalForm()}>
                                    <Button bsStyle='success'>
                                        <i className="fa fa-plus"></i>
                                    </Button>
                                </ModalTrigger>
                            </span>
                        </div>
                    </header>

                    <div className="panel-body">
                        {this.renderList()}
                    </div>

                    <footer className="panel-footer text-right">
                        <Pager
                            limit={this.props.limit}
                            offset={this.state.offset}
                            count={this.state.count}
                            pagesShown={3}
                            onPaginate={this.handlePaginate}
                        />
                    </footer>
                </div>
            </article>
        );
    }
};

module.exports = ListMixin;
