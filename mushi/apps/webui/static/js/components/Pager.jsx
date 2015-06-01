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

var PagerItem = React.createClass({
    propTypes: {
        active: React.PropTypes.bool,
        index: React.PropTypes.number,
        onPaginate: React.PropTypes.func
    },

    handleClick: function(e) {
        e.preventDefault();
        this.props.onPaginate(this.props.index);
    },

    render: function () {
        var item_classes = [];
        if (this.props.active) {
            item_classes.push('active');
        }
        if (this.props.disabled) {
            item_classes.push('disabled');
        }

        var handler = this.props.disabled ? (function(e) {e.preventDefault()}) : this.handleClick;

        return (
            <li className={item_classes.join(' ')}>
              <a href="#" onClick={handler}>{this.props.children}</a>
            </li>
        );
    }
});

var Pager = React.createClass({
    render: function() {
        // Return an empty footer if the current page contains all results.
        if (this.props.count <= this.props.limit) {
            return <nav />;
        }

        // Compute the number of page and the index of current page.
        var page_count = Math.ceil(this.props.count / this.props.limit);
        var current_page = this.props.offset / this.props.limit;

        // Compute the range of the pages to be displayed in the paginator.
        var begin = 0;
        var end = page_count;
        if (this.props.pagesShown < page_count) {
            begin = Math.max(current_page - Math.floor(this.props.pagesShown / 2), 0);
            end = Math.min(begin + this.props.pagesShown, page_count);
        }

        // Generate pagination items.
        var items = [];

        items.push(this.renderPreviousLink(page_count, current_page));

        if (begin > 0) {
            items.push(<PagerItem disabled key="prev-dots">...</PagerItem>);
        }

        for (var i = begin; i < end; ++i) {
            items.push(
                <PagerItem
                  index={i} active={i == current_page} key={i} onPaginate={this.props.onPaginate}
                >
                  {i + 1}
                </PagerItem>
            );
        }

        if (end < page_count) {
            items.push(<PagerItem disabled key="next-dots">...</PagerItem>);
        }

        items.push(this.renderNextLink(page_count, current_page));

        return (
            <nav className="mu-pagination-wrapper">
              <ul className="pagination">
                {items}
              </ul>
            </nav>
        );
    },

    renderPreviousLink: function(page_count, current_page) {
        return (
            <PagerItem
              index={current_page - 1} disabled={current_page <= 0}
              aria-label="Previous" key="prev"
              onPaginate={this.props.onPaginate}
            >
              <span aria-hidden="true">&laquo;</span>
            </PagerItem>
        );
    },

    renderNextLink: function(page_count, current_page) {
        return (
            <PagerItem
              index={current_page + 1} disabled={current_page >= (page_count - 1)}
              aria-label="Next" key="next"
              onPaginate={this.props.onPaginate}
            >
              <span aria-hidden="true">&raquo;</span>
            </PagerItem>
        );
    }
});
