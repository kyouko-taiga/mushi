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

var ModalTrigger = ReactBootstrap.ModalTrigger;
var Button = ReactBootstrap.Button;

var MilestoneList = React.createClass({
    loadMilestones: function() {
        mushi.api.get(this.props.endpoint, {
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this)
        });
    },

    getInitialState: function() {
        return {data: []};
    },

    componentDidMount: function() {
        this.loadMilestones();
        setInterval(this.loadMilestones, this.props.poll_interval);
    },

    handleCreate: function(new_milestone) {
        mushi.api.post(this.props.endpoint, {
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(new_milestone),
            success: function(response) {
                this.state.data.push(response);
                this.setState(this.state);
            }.bind(this)
        });
    },

    render: function() {
        list_items = (function(list_data) {
            var rv = list_data.map(function(item) {
                return <MilestoneListItem key={item.slug} {...item} />;
            });

            if (rv.length > 0) {
                return rv;
            } else {
                return (
                <div className="alert alert-info" role="alert">
                  <i className="fa fa-info-circle"></i> {"You don't have any milestone."}
                </div>
                );
            }
        })(this.state.data);

        return(
        <article className="mu-component mu-list-wrapper col-md-12">
          <div className="panel panel-default">
            <header className="panel-heading clearfix">
              <div className="pull-left">
                <h2><i className="fa fa-list"></i> Milestones</h2>
              </div>
              <div className="pull-right">
                <span className="mu-filter-wrapper">
                  <div className="input-group">
                    <div className="input-group-btn">
                      <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                        <i className="fa fa-search"></i> <span className="caret"></span>
                      </button>
                      <ul className="dropdown-menu" role="menu">
                        <li><a href="#">In progress</a></li>
                        <li><a href="#">Finished</a></li>
                        <li><a href="#">Overdue</a></li>
                      </ul>
                    </div>
                    <input type="search" className="form-control" aria-label="Filter results" placeholder="Filter results" />
                  </div>
                </span>
                <span className="mu-button-wrapper">
                  <ModalTrigger modal={<MilestoneFormModal onModalSubmit={this.handleCreate} title="Create a new milestone" submitText="Create" submitStyle="success" />}>
                    <Button bsStyle='success'><i className="fa fa-plus"></i></Button>
                  </ModalTrigger>
                </span>
              </div>
            </header>

            <div className="panel-body">
              <div id="mu-todo-list" className="mu-list">
                {list_items}
              </div>
            </div>
          </div>
        </article>
        )
    }
});
