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

var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');

var PasswordForm = require('./PasswordForm');
var ProfileForm = require('./ProfileForm');

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

module.exports = Settings;
