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
var Input = ReactBootstrap.Input;
var Modal = ReactBootstrap.Modal;
var OverlayMixin = ReactBootstrap.OverlayMixin;

var IssueInputMixin = {
    getInitialState: function() {
        return {
            value: this.props.value,
            is_valid: (Boolean(this.props.value) || !this.props.required),
            bsStyle: null
        };
    },

    handleChange: function(e) {
        this.setState({value: e.target.value});
    }
};

var IssueLabelInput = React.createClass({
    mixins: [IssueInputMixin],

    validate: function(value) {
        this.state.is_valid = Boolean(value);
        this.state.bsStyle = this.state.is_valid ? null : 'error';

        // Calling setState raises an exception when the enclosing modal is
        // closed immediately after `validate` has been called. A similar
        // unless identical issue has been reported on react's github:
        // https://github.com/facebook/react/issues/2410

        this.setState(this.state);
        return this.state.is_valid;
    },

    handleBlur: function(e) {
        this.validate(e.target.value);
    },

    render: function() {
        return (
        <Input
          {...this.props} type="text" label="Label" placeholder="Enter Label"
          bsStyle={this.state.bsStyle} value={this.state.value}
          onChange={this.handleChange} onBlur={this.handleBlur}
        />
        );
    }
});

var IssueLevelInput = React.createClass({
    mixins: [IssueInputMixin],

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
        <Input
          {...this.props} type="select" label="Level"
          bsStyle={this.state.bsStyle} value={this.state.value} onChange={this.handleChange}
        >
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="minor">Minor</option>
        </Input>
        );
    }
});

var IssueStatuslInput = React.createClass({
    mixins: [IssueInputMixin],

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
        <Input
          {...this.props} type="select" label="Status"
          bsStyle={this.state.bsStyle} value={this.state.value} onChange={this.handleChange}
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </Input>
        );
    }
});

var IssueDescriptionInput = React.createClass({
    mixins: [IssueInputMixin],

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
        <Input
          {...this.props} type="textarea" label="Description (optional)"
          placeholder="Enter description"
          bsStyle={this.state.bsStyle} value={this.state.value} onChange={this.handleChange}
        />
        );
    }
});

var IssueReproducibleInput = React.createClass({
    getInitialState: function() {
        return {
            checked: this.props.checked,
            is_valid: true,
        };
    },

    handleChange: function(e) {
        this.setState({checked: e.target.checked});
    },

    validate: function(value) {
        return true;
    },

    render: function() {
        return (
        <Input
          {...this.props} type="checkbox" label="Reproducible"
          checked={this.state.checked} onChange={this.handleChange}
        />
        );
    }
});

var IssueMilestoneInput = React.createClass({
    mixins: [IssueInputMixin],

    loadMilestones: function() {
        mushi.api.get(this.props.endpoint + '?max-depth=1', {
            dataType: 'json',
            cache: false,
            success: function(response) {
                this.setState({milestones: response});
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {'milestones': []};
    },

    componentDidMount: function() {
        this.loadMilestones();
    },

    validate: function(value) {
        return true;
    },

    render: function() {
        var options = [<option value="">No milestone</option>].concat(
            this.state.milestones.map(function(item) {
                return <option value={item.slug}>{item.name}</option>;
            })
        );

        return (
        <Input
          {...this.props} type="select" label="Milestone (optional)"
          bsStyle={this.state.bsStyle} value={this.state.value} onChange={this.handleChange}
        >
          {options}
        </Input>
        );
    }
});

var IssueFormModal = React.createClass({

    handleSubmit: function(e) {
        e.preventDefault();

        // Retrieve form values.
        var data = {};
        var is_valid = true;

        var i = 0;

        for (var input_name in this.refs) {
            var input = this.refs[input_name];
            data[input_name] = input.state.value;

            // Exit if there are format validation errors.
            is_valid = is_valid && input.validate(data[input_name]);
        }

        if (!is_valid) {
            return;
        }

        // Handle the reproducible input as a special case, since checkboxes
        // state is stored in `checked` rather than in `value`.
        data.reproducible = this.refs.reproducible.state.checked;

        this.props.onModalSubmit(data);
        this.props.onRequestHide();
        return;
    },

    render: function() {
        if (this.props.hideMilestone) {
            var milestone_input = <span />;
        } else {
            var milestone_slug = (function(milestone) {
                if (milestone) {
                    return milestone.slug;
                } else {
                    return null;
                }
            })(this.props.milestone);

            var milestone_input = (
            <IssueMilestoneInput ref="milestone" endpoint='milestones/' value={milestone_slug} />
            );
        }

        return (
        <Modal {...this.props}>
          <form onSubmit={this.handleSubmit}>
            <div className="modal-body">
              <IssueLabelInput ref="label" value={this.props.label} required />
              <IssueLevelInput ref="level" value={this.props.level || 'important'} required />
              <IssueStatuslInput ref="status" value={this.props.status || 'open'} required />
              <IssueDescriptionInput ref="description" value={this.props.description} />
              <IssueReproducibleInput ref="reproducible" checked={this.props.reproducible} />
              {milestone_input}
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

