﻿/*global isEmpty,isFunction,namespace,extend*/
// @DONE (2013-09-17 11:06)
define([
    './core'
], function (mdsol, $) {
    /*
    * Use IIFE to prevent cluttering of globals
    *
    * NOTE: This module requires jQuery, however it should not be listed as an AMD module 
    *       dependency. Only build-time dependencies should be listed above.
    */
    (function () {
        var _$element,
            _requests = {},
            _uuid = 0,
            _contentTypeEnum = {
                JSON: 'application/json; charset=utf-8',
                TEXT: 'text/plain; charset=utf-8',
                HTML: 'text/html; charset=utf-8'
            };

        function container(value) {
            var $container;

            if (!arguments.length) {
                return _$element && _$element.parent();
            }

            // Destroy current element
            if (_$element) {
                _$element.remove();
                _$element = null;
            }

            // Locate new container element
            if (isString(value)) {
                $container = $(value);
            } else if (!value || (value && value.jquery)) {
                $container = value;
            }

            // Create new element and append to container
            if ($container) {
                _$element = $('<div id="ajax_progress"><img src="./images/ajax.gif" /><span>Please wait...</span></div>')
                    .hide()
                    .appendTo($container);
            }

            return mdsol;
        }

        function updateRequests(uuid, params) {
            if (arguments.length === 1) {
                delete _requests[uuid];
            } else {
                _requests[uuid] = params;
            }

            if (!isEmpty(_requests)) {
                // Create the 'please wait' display if it doesnt exist. This should only
                // happen the first time an ajax request is made.
                if (!_$element) {
                    container('body');
                }

                // Show 'waiting' display
                _$element.show();
                mdsol.ui.center(_$element);
            } else {
                // Hide 'waiting' display
                _$element.hide();
            }
        }

        function onAjaxSuccess(data/*, status, xhr*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (isFunction(callback)) {
                callback(true, data, this.userData, this);
            }
        }

        function onAjaxError(xhr/*, status, err*/) {
            var callback = this.callback;

            updateRequests(this.uuid);

            if (isFunction(callback)) {
                callback(false, xhr, this.userData, this);
            }
        }

        function jxhrRequest(uri, method, contentType, data, callback, userData) {
            var type = (contentType || 'html'),
                params = {
                    type: method,
                    url: uri,
                    data: data,
                    contentType: _contentTypeEnum[type.toUpperCase()],
                    cache: false,
                    dataType: type.toLowerCase(),
                    userData: userData,
                    uuid: _uuid,
                    callback: callback,
                    success: onAjaxSuccess,
                    error: onAjaxError
                };

            updateRequests(_uuid, params);
            _uuid++;

            $.ajax(params);

            return mdsol;
        }

        function post(uri, contentType, data, callback, userData) {
            return jxhrRequest(uri, 'POST', contentType, data, callback, userData);
        }

        function get(uri, contentType, data, callback, userData) {
            return jxhrRequest(uri, 'GET', contentType, data, callback, userData);
        }

        function dispose() {
            // TODO: Perform any cleanup

            container(null);

            return mdsol;
        }

        // Expose public members
        namespace('mdsol.ajax', {
            container: container,

            contentTypeEnum: _contentTypeEnum,

            post: post,

            get: get,

            dispose: dispose
        });
    } ());
});
