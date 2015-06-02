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

var $ = require('jquery');
var Backbone = require('backbone');
var React = require('react');

var mushi = require('./common');

var ContentWrapper = require('./components/ContentWrapper');

var Router = Backbone.Router.extend({
    routes : {
        ''                 : 'dashboard',
        'milestones'       : 'milestones',
        'milestones/:slug' : 'milestone_detail',
        'issues'           : 'issues',
        'issues/:uid'      : 'issue_detail',
        'settings'         : 'settings',
        'logout'           : 'logout'
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
    settings: function() {
        this.current = 'settings';
    },
    logout: function() {
        mushi.api.delete('tokens/' + mushi.cookies.get('Auth-Token'), {
            success: function() {
                mushi.cookies.delete('Auth-Token');
                window.location = '/login';
            }
        });
    }
});

// Create the Backbone router.
var router = new Router();

// Trigger the initial route and enable HTML5 History API support, set the
// root folder to '/' by default and add a click handler that sends all
// links to Backbone.history.navigate unldess they have a data-bypass
// attribute.
// See http://stackoverflow.com/questions/12081894.
Backbone.history.start({ pushState: false, root: '/' });

$(document).on("click", "a.mu-app-link:not([data-bypass])", function(e) {
    var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
    var root = location.protocol + "//" + location.host + '/';

    if (href.prop && href.prop.slice(0, root.length) === root) {
        e.preventDefault();
        Backbone.history.navigate(href.attr, true);
    }
});

// Render the page content.
React.render(
    <ContentWrapper router={router} />,
    document.getElementById('mu-content-wrapper')
);
