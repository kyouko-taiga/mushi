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

(function(mushi, $, undefined) {

    var BreadcrumbComponent = React.createClass({
        render: function() {
            var entries = this.props.hierarchy.map(function(entry) {
                return <li><a href={entry.endpoint}>{entry.label}</a></li>;
            });
            entries.push(<li className="active">{this.props.current}</li>)

            return (
            <div id="mu-breadcrumb" class="row">
              <div className="col-md-12">
                <ol className="breadcrumb">
                  {entries}
                </ol>
              </div>
            </div>
            );
        }
    });

    var DashboardComponent = React.createClass({
        render: function() {
            return (
            <div>
              <BreadcrumbComponent hierarchy={[]} current="Dashboard" />
              <MilestoneList endpoint='milestones/' poll_interval='60000' />
              <IssueList endpoint='issues/' poll_interval='60000' />
            </div>
            );
        }
    });

    var MilestonesComponent = React.createClass({
        render: function() {
            return (
            <div>
              <BreadcrumbComponent
                hierarchy={[{endpoint: '#', label: 'Dashboard'}]}
                current="Milestones"
              />
              <MilestoneList endpoint='milestones/' poll_interval='60000' />
            </div>
            );
        }
    });

    var MilestoneDetailComponent = React.createClass({
        render: function() {
            return (
            <div>
              <BreadcrumbComponent
                hierarchy={[
                    {endpoint: '#', label: 'Dashboard'},
                    {endpoint: '#milestones', label: 'Milestones'}
                ]}
                current={this.props.router.args.slug}
              />
              <Milestone endpoint={'milestones/' + this.props.router.args.slug} />
            </div>
            );
        }
    });

    var IssuesComponent = React.createClass({
        render: function() {
            return (
            <div>
              <BreadcrumbComponent
                hierarchy={[{endpoint: '#', label: 'Dashboard'}]}
                current="Issues"
              />
              <IssueList endpoint='issues/' poll_interval='60000' />
            </div>
            );
        }
    });

    var IssueDetailComponent = React.createClass({
        render: function() {
            return (
            <div>
              <BreadcrumbComponent
                hierarchy={[
                    {endpoint: '#', label: 'Dashboard'},
                    {endpoint: '#issues', label: 'Issues'}
                ]}
                current={'#' + this.props.router.args.uid}
              />
              <Issue endpoint={'issues/' + this.props.router.args.uid} />
            </div>
            );
        }
    });

    var InterfaceComponent = React.createClass({
        componentWillMount : function() {
            this.callback = (function() {
                this.forceUpdate();
            }).bind(this);
  
            this.props.router.on('route', this.callback);
        },

        componentWillUnmount : function() {
            this.props.router.off('route', this.callback);
        },

        render : function() {
            if (this.props.router.current == 'dashboard') {
                return <DashboardComponent router={router} />;
            }
            if (this.props.router.current == 'milestones') {
                return <MilestonesComponent router={router} />;
            }
            if (this.props.router.current == 'milestone_detail') {
                return <MilestoneDetailComponent router={router} />;
            }
            if (this.props.router.current == 'issues') {
                return <IssuesComponent router={router} />;
            }
            if (this.props.router.current == 'issue_detail') {
                return <IssueDetailComponent router={router} />;
            }
            return <div />;
        }
    })

    var Router = Backbone.Router.extend({
        routes : {
            ''                 : 'dashboard',
            'milestones'       : 'milestones',
            'milestones/:slug' : 'milestone_detail',
            'issues'           : 'issues',
            'issues/:uid'      : 'issue_detail'
        },
        dashboard: function() {
            this.current = 'dashboard';
        },
        milestones: function() {
            this.current = 'milestones';
        },
        milestone_detail: function(slug) {
            this.current = 'milestone_detail';
            this.args = {'slug': slug};
        },
        issues: function() {
            this.current = 'issues';
        },
        issue_detail: function(uid) {
            this.current = 'issue_detail';
            this.args = {'uid': uid};
        },
    });
 
    var router = new Router();
    mushi.router = router;

    React.render(
        <InterfaceComponent router={router} />,
        document.getElementById('mu-content-wrapper')
    );

    // Trigger the initial route and enable HTML5 History API support, set the
    // root folder to '/' by default and add a click handler that sends all
    // links to Backbone.history.navigate unldess they have a data-bypass
    // attribute.
    // See http://stackoverflow.com/questions/12081894.
    Backbone.history.start({ pushState: false, root: '/' });

    $(document).on("click", "a:not([data-bypass])", function(e) {
        var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
        var root = location.protocol + "//" + location.host + '/';

        if (href.prop && href.prop.slice(0, root.length) === root) {
            e.preventDefault();
            Backbone.history.navigate(href.attr, true);
        }
    });

    $('#logout').click(function(e) {
        e.preventDefault();

        mushi.api.delete('tokens/' + mushi.cookies.get('Auth-Token'), {
            success: function() {
                mushi.cookies.delete('Auth-Token');
                window.location.replace('/');   
            }
        });
    });

}(window.mushi = window.mushi || {}, jQuery));