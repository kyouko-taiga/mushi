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

var ButtonInput = require('react-bootstrap/lib/ButtonInput');
var Input = require('react-bootstrap/lib/Input');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
var Tooltip = require('react-bootstrap/lib/Tooltip');

var mushi = require('../../common');

var ProfileNameInput = React.createClass({
    isValid: function() {
        return (Boolean(this.props.value) || !this.props.required);
    },

    handleChange: function(e) {
        this.props.onInputChange(this.props.name, e.target.value);
    },

    render: function() {
        var style = this.isValid() ? null : 'error';

        return (
            <Input
                {...this.props} type="text" label="Full name" placeholder="Enter full name"
                bsStyle={style} value={this.props.value}
                onChange={this.handleChange}
            />
        );
    }
});

var ProfileForm = React.createClass({
    loadUser: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            data: {'max-depth': 1},
            cache: false,
            success: function(response) {
                this.setState(response);
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {key: 1};
    },

    componentDidMount: function() {
        this.loadUser();
    },

    handleInputChange: function(input_name, input_value) {
        var update = {};
        update[input_name] = input_value;
        this.setState(update);
    },

    handleSubmit: function(e) {
        e.preventDefault();

        var data = {};

        // Check if all inputs are valid.
        var is_valid = true;

        for (var input_name in this.refs) {
            var input = this.refs[input_name];
            is_valid = is_valid && input.isValid();
            data[input_name] = this.state[input_name];
        }

        if (!is_valid) {
            return;
        }

        // Send form data to the server.
        mushi.api.post(this.props.endpoint, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            success: function(response) {
                mushi.alert('The changes have been saved successfully.', 'success', 'fa fa-check');
                this.setState(response);
            }.bind(this)
        });
    },

    render: function() {
        return (
            <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label className="col-sm-2 control-label">Email address</label>
                    <div className="col-sm-10">
                        <p className="form-control-static">{this.state.email}</p>
                    </div>
                </div>
                <div className="form-group">
                    <label className="col-sm-2 control-label">Profile picture</label>
                    <div className="col-sm-10">
                        <OverlayTrigger
                            placement="right"
                            overlay={<Tooltip>
                                Mushi uses <strong>Gravatar</strong> to get your profile picture.
                                Go to gravatar.com if you want to change it.
                                </Tooltip>}
                        >
                            <img alt={this.state.email} className="mu-profile-picture media-object img-rounded" src={this.state.profile_picture} />
                        </OverlayTrigger>
                    </div>
                </div>
                <ProfileNameInput ref="name" name="name" labelClassName="col-sm-2" wrapperClassName="col-sm-10" value={this.state.name} onInputChange={this.handleInputChange} required />
                <ButtonInput type="submit" bsStyle="warning" wrapperClassName="col-sm-offset-2 col-sm-10" value="Save changes" />
            </form>
        );
    }
});

module.exports = ProfileForm;
