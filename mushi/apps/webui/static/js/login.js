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

$('form').submit(function(e) {
    e.preventDefault();

    // Remove previous error messages
    var form = $(this);
    form.find('.has-error').removeClass('has-error');

    // Check if the form has been filled out
    var empty = form.find('input').filter(function() { return this.value === ''; });
    if (empty.length) {
        empty.parent().addClass('has-error');
        return false;
    }

    // Disable the form buttons
    form.find('button').prop('disabled', true);

    // Ask the api for a new user token
    mushi.api.post('tokens/', {
        data: JSON.stringify(form.serializeObject()),
        contentType: 'application/json; charset=utf-8',
        success: function(response) {
            // Store the token within the cookies
            mushi.cookies.set('Auth-Token', response.value, response.expires_at)
            window.location.replace('/');
        },
        error: function(xhr) {
            if (xhr.status == 403) {
                mushi.alert('Incorrect mail address and/or password.');
            } else {
                mushi.alert_xhr(xhr);
            }
        },
        complete: function() {
            // Enable the form buttons
            form.find('button').prop('disabled', false);
        }
    });
});
