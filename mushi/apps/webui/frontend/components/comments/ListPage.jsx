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

var Breadcrumb = require('../Breadcrumb');
var CommentList = require('./List');

var CommentListPage = React.createClass({
    render: function() {
        return (
            <div>
                <Breadcrumb
                    hierarchy={[{endpoint: '#', label: 'Dashboard'}]}
                    current="Comments"
                />
                <CommentList endpoint='comments/' pollInterval={60000} limit={10} />
            </div>
        );
    }
});

module.exports = CommentListPage;
