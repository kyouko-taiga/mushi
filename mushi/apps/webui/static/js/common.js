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

(function(mushi, undefined) {

    // Extend jQuery to add a function that serializes from values to JSON.
    $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    // Display an alert on the top of the page.
    // Parameters:
    //      message: The message to be displayed.
    //      type (optional): The type of the alert (success, info, warning or
    //          danger; default is danger).
    //      icon (optional): The icon of the alert.
    mushi.alert = function(message, type, icon) {
        icon = '<span class="icon fa ' + (icon || 'fa-bullhorn') + ' fa-2x"></span>';
        var ntf = new NotificationFx({
            message: icon + '<p>' + message + '</p>',
            layout:  'bar',
            effect:  'slidetop',
            type:    type || 'danger'
        });
        ntf.show();
        return ntf;
    };

    // Display an API error response as an alert on the top of the page.
    mushi.alert_xhr = function(xhr) {
        var response = xhr.responseJSON;
        if (response && response.code) {
            mushi.alert(response.status + ' (' + response.code + ')');
        } else {
            mushi.alert(xhr.statusText + ' (' + xhr.status + ')');
        }
    };

    // A collection of utility functions.
    (function(cookies) {

        // Return the value of a particular cookie from its name.
        cookies.get = function(cookie_name) {
            cookie_name = cookie_name + '=';
            var ca = document.cookie.split(';');
            for(var i = 0, len = ca.length; i < len; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(cookie_name) == 0) {
                    return c.substring(cookie_name.length, c.length);
                }
            }
            return undefined;
        };

        // Set a new cookie on the browser.
        cookies.set = function(cookie_name, cookie_value, expires_at) {
            var d = new Date();
            d.setTime(expires_at * 1000);
            expires_at = 'expires=' + d.toUTCString();
            document.cookie = cookie_name + '=' + cookie_value + '; ' + expires_at;
        };

        // Delete a particular cookie from its name.
        cookies.delete = function(cookie_name) {
            mushi.cookies.set(cookie_name, undefined, 1)
        };

    }(mushi.cookies = mushi.cookies || {}));

    // A collection of helpers to access the API.
    (function(api, undefined) {
        // Return an object containing the information about the logged user,
        // or null if the current user isn't logged.
        api.whoami = function() { return api.sync('whoami', 'GET').data; };

        // Shortcut for `api.async(endpoint, 'GET', settings)`.
        api.get = function(endpoint, settings) {
            api.async(endpoint, 'GET', settings);
        }

        // Shortcut for `api.async(endpoint, 'POST', settings)`.
        api.post = function(endpoint, settings) {
            api.async(endpoint, 'POST', settings);
        }

        // Shortcut for `api.async(endpoint, 'DELETE', settings)`.
        api.delete = function(endpoint, settings) {
            api.async(endpoint, 'DELETE', settings);
        }

        // Call the API with asynchronously.
        //
        // Unless `error` is specified in the optional settings, api errors
        // will be reported as an application alert. Refer to the online
        // documentation of `jQuery.ajax` for a documentation of the other
        // request settings.
        api.async = function(endpoint, method, settings) {
            settings = settings || {};
            settings.url = api.root + endpoint;
            settings.method = method;
            settings.error = settings.error || mushi.alert_xhr;

            $.ajax(settings);
        }

        // Identical to api.async but performs synchronously.
        api.sync = function(endpoint, method, settings) {
            var response = null;

            settings = settings || {};
            settings.async = false;
            settings.success = function(data) { response = data; };

            api.async(endpoint, method, settings);
            return response;
        }

    }(mushi.api = mushi.api || {}));

}(window.mushi = window.mushi || {}));
