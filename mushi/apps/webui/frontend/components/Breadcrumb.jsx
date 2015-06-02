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

var Breadcrumb = React.createClass({
    render: function() {
        var entries = this.props.hierarchy.map(function(entry) {
            return <li key={entry.endpoint}><a href={entry.endpoint}>{entry.label}</a></li>;
        });
        entries.push(<li className="active" key="active">{this.props.current}</li>)

        return (
            <div id="mu-breadcrumb" className="row">
                <div className="col-md-12">
                    <ol className="breadcrumb">
                        {entries}
                    </ol>
                </div>
            </div>
        );
    }
});

module.exports = Breadcrumb;
