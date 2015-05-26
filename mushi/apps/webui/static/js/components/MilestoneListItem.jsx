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

var MilestoneListItem = React.createClass({
    render: function() {
        var due_date_item = function() {
            if (this.props.due_date) {
                var due_moment = moment(this.props.due_date * 1000);

                // Add the class 'mu-danger' to the due date span if the
                // milestone is overdue.
                var due_date_class = 'mu-milestone-meta-item';
                if (due_moment - moment() < 0) {
                    due_date_class += ' mu-danger';
                }

                return (
                <span className={due_date_class}>
                  due for {due_moment.format("MMMM Do YYYY")} ({due_moment.fromNow()})
                </span>
                );
            }

            return <span>No due date</span>;
        }.bind(this)

        return (
        <div className="mu-list-item">
          <div className="container-fluid">
            <div className="row">
              <div className="mu-milestone-title col-sm-6">
                <div className="mu-milestone-name">
                  <a href={'#milestones/' + this.props.slug}>{this.props.name}</a>
                </div>
                <div className="mu-milestone-meta">
                  {due_date_item()}
                </div>
                <div className="mu-milestone-description">
                  {this.props.description}
                </div>
              </div>
              <div className="mu-milestone-progress col-sm-6">
                <div className="mu-milestone-progress-bar">
                  <div className="progress">
                    <div className="progress-bar progress-bar-success" role="progressbar" aria-valuenow="63" aria-valuemin="0" aria-valuemax="100" style={{width: this.props.progress + '%'}}>
                      <span className="sr-only">{this.props.progress}% Complete</span>
                    </div>
                  </div>
                </div>
                <div className="mu-milestone-progress-meta">
                  {this.props.progress}% ({this.props.open_count} open and {this.props.closed_count} closed)
                </div>
              </div>
            </div>
          </div>
        </div>
        );
    }
});