﻿define([
    '../core'
], function (mdsol) {
    mdsol.ui.DialogPage = (function () {
        'use strict';

        function DialogPage() {
            if (!(this instanceof DialogPage)) {
                return new DialogPage();
            }

            return this;
        }

        return DialogPage;
    } ());
});