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
var Input = require('react-bootstrap/lib/Input');
var Modal = require('react-bootstrap/lib/Modal');

var MilestoneInputMixin = {
    getInitialState: function() {
        return {
            value: this.props.value,
            is_valid: (Boolean(this.props.value) || !this.props.required),
            bsStyle: null
        };
    },

    getValue: function() {
        return this.state.value;
    },

    handleChange: function(e) {
        this.setState({value: e.target.value});
    }
};

var MilestoneNameInput = React.createClass({
    mixins: [MilestoneInputMixin],

    validate: function(value) {
        this.state.is_valid = Boolean(value);
        this.state.bsStyle = this.state.is_valid ? null : 'error';

        this.setState(this.state);
        return this.state.is_valid;
    },

    handleBlur: function(e) {
        this.validate(e.target.value);
    },

    render: function() {
        return (
            <Input
                {...this.props} type="text" label="Name" placeholder="Enter name"
                bsStyle={this.state.bsStyle} value={this.state.value}
                onChange={this.handleChange} onBlur={this.handleBlur}
            />
        );
    }
});

var MilestoneDescriptionInput = React.createClass({
    mixins: [MilestoneInputMixin],

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
            <Input
                {...this.props} type="textarea" label="Description (optional)"
                placeholder="Enter description"
                bsStyle={this.state.bsStyle} value={this.state.value}
                onChange={this.handleChange}
            />
        );
    }
});

var MilestoneDueDateInput = React.createClass({
    mixins: [MilestoneInputMixin],

    validate: function(value) {
        if (!value) {
            this.state.is_valid = true;
        } else {
            var m = moment(value, 'YYYY-MM-DD');
            this.state.is_valid = m.isValid();
        }
        this.state.bsStyle = this.state.is_valid ? null : 'error';

        this.setState(this.state);
        return this.state.is_valid;
    },

    handleBlur: function(e) {
        this.validate(e.target.value);
    },

    render: function() {
        return (
            <Input
                {...this.props} type="date" label="Due data (optional)"
                placeholder="yyyy-mm-dd (Ex: 2015-05-26)"
                bsStyle={this.state.bsStyle} value={this.state.value}
                onChange={this.handleChange} onBlur={this.handleBlur}
            />
        );
    }
});

var MilestoneModalForm = React.createClass({
    handleSubmit: function(e) {
        e.preventDefault();

        // Retrieve form values.
        var data = {};
        var is_valid = true;

        for (var input_name in this.refs) {
            var input = this.refs[input_name];
            data[input_name] = input.getValue();

            // Exit if there are format validation errors.
            is_valid = is_valid && input.validate(data[input_name]);
        }

        if (!is_valid) {
            return;
        }

        // Convert the "due date" string to a unix timestamp (if set).
        if (data.due_date) {
            data.due_date = Math.round(moment(data.due_date, 'YYYY-MM-DD') / 1000);
        } else {
            delete data.due_date;
        }

        // Slugify the milestone name to set its slug.
        function slugify(text) {
            if (!text) {
                return '';
            }

            return text.toString().toLowerCase()
                .replace(/\s+/g, '-')           // Replace spaces with -
                .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                .replace(/^-+/, '')             // Trim - from start of text
                .replace(/-+$/, '');            // Trim - from end of text
        }
        data.slug = this.props.slug ? this.props.slug : slugify(data.name);

        this.props.onModalSubmit(data);
        this.props.onRequestHide();
        return;
    },

    render: function() {
        // Convert the "due date" timestamp to a formatted string.
        var due_date = this.props.due_date;
        if (due_date) {
            var m = moment(due_date * 1000);
            due_date = m.format('YYYY-MM-DD');
        }

        return (
            <Modal {...this.props}>
                <form onSubmit={this.handleSubmit}>
                    <div className="modal-body">
                        <MilestoneNameInput ref="name" value={this.props.name} required />
                        <MilestoneDescriptionInput ref="description" value={this.props.description} />
                        <MilestoneDueDateInput ref="due_date" value={due_date} />
                    </div>
                    <div className="modal-footer">
                        <Button onClick={this.props.onRequestHide}>Cancel</Button>
                        <Button type="submit" bsStyle={this.props.submitStyle}>{this.props.submitText}</Button>
                    </div>
                </form>
            </Modal>
        );
    }
});

module.exports = MilestoneModalForm;
