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

var ButtonInput = ReactBootstrap.ButtonInput;
var Input = ReactBootstrap.Input;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var OverlayTrigger = ReactBootstrap.OverlayTrigger;
var Tooltip = ReactBootstrap.Tooltip;

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
                overlay={
                  <Tooltip>
                    Mushi uses <strong>Gravatar</strong> to get your profile picture.
                    Go to gravatar.com if you want to change it.
                  </Tooltip>
                }
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

var PasswordForm = React.createClass({
    getInitialState: function() {
        return {
            is_current_valid: true,
            is_confirm_valid: true
        };
    },

    handleSubmit: function(e) {
        e.preventDefault();

        var current_password = this.refs.current_password.getValue();
        var new_password = this.refs.new_password.getValue();
        var confirmation = this.refs.confirmation.getValue();

        if (new_password != confirmation) {
            this.setState({is_confirm_valid: false});
        } else {
            this.setState({is_confirm_valid: true});
            data = {
                current_password: current_password,
                new_password: new_password
            };

            mushi.api.post('users/me/password', {
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                data: JSON.stringify(data),
                success: function(response) {
                    mushi.alert('The password have been saved successfully.', 'success', 'fa fa-check');
                    $.each(this.refs, function(i, child) {
                        child.getInputDOMNode().value = '';
                    });
                }.bind(this)
            });
        }
    },

    render: function() {
        var confirm_style = this.state.is_confirm_valid ? null : 'error';

        return (
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <Input type="password" ref="current_password" label="Current password" labelClassName="col-sm-2" wrapperClassName="col-sm-10" placeholder="Enter current password" />
          <Input type="password" ref="new_password" label="New password" labelClassName="col-sm-2" wrapperClassName="col-sm-10" placeholder="Enter new password" />
          <Input type="password" ref="confirmation" label="Confirm new password" bsStyle={confirm_style} labelClassName="col-sm-2" wrapperClassName="col-sm-10" placeholder="Confirm new password" />
          <ButtonInput type="submit" bsStyle="warning" wrapperClassName="col-sm-offset-2 col-sm-10" value="Change password" />
        </form>
        );
    }
});

var Settings = React.createClass({
    getInitialState: function() {
        return {key: 1};
    },

    handleSelect: function(selected_key) {
        this.setState({key: selected_key});
    },

    render: function() {
        if (this.state.key == 1) {
            var tab_panel = <ProfileForm endpoint="users/me" />;
        } else {
            var tab_panel = <PasswordForm endpoint="users/me" />;
        }

        return (
        <article className="mu-component mu-settings-wrapper col-md-12">
          <div className="panel panel-default">
            <header className="panel-heading clearfix">
              <h2><i className="fa fa-cog"></i> Settings</h2>
            </header>

            <div className="panel-body">
              <Nav bsStyle="tabs" activeKey={this.state.key} onSelect={this.handleSelect}>
                <NavItem eventKey={1} href="#profile">Profile settings</NavItem>
                <NavItem eventKey={2} href="#password">Change password</NavItem>
              </Nav>
              {tab_panel}
            </div>
          </div>
        </article>
        );
    }
});