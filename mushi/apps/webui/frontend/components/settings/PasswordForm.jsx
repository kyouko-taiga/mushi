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

var mushi = require('../../common');

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

module.exports = PasswordForm;
