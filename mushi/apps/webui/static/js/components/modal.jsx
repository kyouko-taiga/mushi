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

var ModalTrigger = React.createClass({
    handleClick: function(e) {
        $(this.refs.payload.getDOMNode()).modal();
    },

    render: function() {
        return (
            <span onClick={this.handleClick}>
              {this.props.trigger}
              <Modal ref="payload"
                header={this.props.header}
                body={this.props.body}
                footer={this.props.footer}
              />
            </span>
        );
    }
});

var Modal = React.createClass({
    componentDidMount: function() {
        $(this.getDOMNode()).modal({
            background: true,
            keyboard: true,
            show: false
        });
    },

    componentWillUnmount: function() {
        $(this.getDOMNode()).off('hidden');
    },

    handleClick: function(e) {
        e.stopPropagation();
    },

    render: function() {
        return (
            <div onClick={this.handleClick} className="modal fade" role="dialog" aria-hidden="true">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">{this.props.header}</div>
                  <div className="modal-body">{this.props.body}</div>
                  <div className="modal-footer">{this.props.footer}</div>
                </div>
              </div>
            </div>
        );
    }
});
