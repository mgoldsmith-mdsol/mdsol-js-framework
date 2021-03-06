﻿define([
    './var/global',
    './var/hasOwnProperty',
    './var/isArray',
    './var/keys',
    './var/natives',
    './var/push',
    './var/slice',
    './var/toString'
], function (global, hasOwnProperty, isArray, keys, natives, push, slice, toString) {
    var mdsol = {},
        IS_DONTENUM_BUGGY = !({ toString: null }).propertyIsEnumerable('toString');

    function namespace(identifier, objects) {
        var ns = global, parts, i, item;

        if (identifier !== '') {
            parts = identifier.split('.');
            for (i = 0; i < parts.length; i++) {
                if (!ns[parts[i]]) {
                    ns[parts[i]] = {};
                }

                ns = ns[parts[i]];
            }
        }

        if (!objects) {
            return ns;
        }

        for (item in objects) {
            if (objects.hasOwnProperty(item)) {
                ns[item] = objects[item];
            }
        }

        return ns;
    };

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isNumber(obj) {
        return typeof obj === 'number';
    }

    function isObject(obj) {
        return toString.call(obj) === '[object Object]';
    }

    function isFunction(obj) {
        return toString.call(obj) === '[object Function]';
    }

    function isPlainObject(obj) {
        var key;

        // Borrowed for jQuery v1.8.2 (why re-invent the wheel)

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || !isObject(obj) || obj.nodeType || obj === obj.window) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (obj.constructor &&
                !hasOwnProperty.call(obj, 'constructor') &&
                !hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in obj) {
        }

        return key === undefined || hasOwnProperty.call(obj, key);
    }

    function isDate(o) {
        return toString.call(o) === '[object Date]';
    }

    function isEmpty(o) {
        var p;

        if (o === null || o === undefined) {
            return true;
        } else if (typeof o === 'string' || isArray(o)) {
            return !!o.length;
        } else if (!isObject(o)) {
            throw new TypeError('Invalid data type.');
        }

        for (p in o) {
            return !p;
        }

        return true;
    }

    function isOwn(obj, key) {
        return hasOwnProperty.call(obj, key);
    }

    function getType(obj) {
        return toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    }

    function toArray(value) {
        if (value === null || value === undefined) {
            return [];
        } else if (isArray(value)) {
            return value;
        }

        // It would make sense at this point to add functionality to convert
        // an 'arguments' object to an actual array. Due to the overhead of
        // testing if 'value' is an actual 'Arguments' object accurately and
        // cross-browser, however, we will maintain makeArray() separately.

        return [value];
    }

    function safeCopyProperty(tgt, org, methods) {
        var nativeProto = natives[toString.call(tgt)],
            m, i;

        // Copy the property if it is not a native prototype method
        for (i = methods.length; i--; ) {
            m = methods[i];
            if (org[m] !== nativeProto[m]) {
                tgt[m] = org[m];
            }
        }
    }

    function exists(identifier) {
        /* Checks if the specified identifier is defined */
        var a, i, len,
            ns = global;

        if (!identifier) {
            return false;
        }

        a = identifier.split('.');
        for (i = 0, len = a.length; i < len; i++) {
            if (!ns[a[i]]) {
                return false;
            }

            ns = ns[a[i]];
        }

        return true;
    }

    function clone(o) {
        var result, p;

        if (isArray(o)) {
            result = [];
            for (p in o) {
                result[p] = clone(o[p]);
            }
        } else if (isObject(o)) {
            if (isFunction(o.clone)) {
                return o.clone();
            }

            result = {};

            // See comment in declaration of IS_DONTENUM_BUGGY for details
            if (object && IS_DONTENUM_BUGGY) {
                safeCopyProperty(result, o, ['toString', 'valueOf']);
            }

            for (p in o) {
                if (o.hasOwnProperty(p)) {
                    result[p] = clone(o[p]);
                }
            }

            return result;
        }

        return o;
    }

    function extend(/*[ deep,] target, srcA[, srcB[, ...]] */) {
        var a = slice.call(arguments),
                shallow = true,
                tgt, src,
                o, p, i, v,
                len;

        if (typeof a[0] === 'boolean') {
            shallow = !a.shift();
        }

        tgt = a.shift();
        src = toArray(a);

        // Clone each object
        for (i = 0, len = src.length; i < len; i++) {
            o = src[i] || {};

            // See comment in declaration of IS_DONTENUM_BUGGY for details
            if (IS_DONTENUM_BUGGY) {
                safeCopyProperty(tgt, o, ['toString', 'valueOf']);
            }

            // Clone next object
            for (p in o) {
                if (o.hasOwnProperty(p)) {
                    v = o[p];
                    if (!shallow && v && isObject(v)) {
                        tgt[p] = tgt[p] || {};
                        extend(true, tgt[p], v);
                    } else {
                        tgt[p] = v;
                    }
                }
            }
        }

        return tgt;
    };

    /*
    * Perform an action on each element in an array-like object.
    */
    function each(array, action) {
        var i, len;

        for (i = 0, len = array.length; i < len; i++) {
            action(array[i]);
        }

        return mdsol;
    }

    function merge() {
        var args = [{}];

        push.apply(args, arguments);

        return extend.apply(this, args);
    }

    function values(obj) {
        var result = [], p;

        for (p in obj) {
            result.push(obj[p]);
        }

        return result;
    }

    /*
    * Convert an array-like object to an array.
    * Ideal for converting `arguments` to an array.
    * For performance sake, this is a separate method from toArray.
    */
    function makeArray(obj, index) {
        return slice.call(obj, index || 0);
    }

    function getValue(o, identifier) {
        var a = identifier.split('.'),
            item = o,
            i, len;

        for (i = 0, len = a.length; i < len && item; i++) {
            item = a[i] in item ? item[a[i]] : undefined;
        }

        return item;
    }

    function proxy(obj, target, callback, methods) {
        var nativeProto = natives[toString.call(target)],
            override;

        for (override in nativeProto) {
            if (nativeProto.hasOwnProperty(override)
                && isFunction(nativeProto[override])
                && (!methods.length || methods.indexOf(override) !== -1)
                && target[override] === undefined) {
                /*
                * Create native method on `target` which will call `callback` if provided;
                * otherwise, the call will be applied directly to `target`. Prevent
                * clobber of existing methods if present.
                */
                target[override] = (function (that, tgt, c, nativeMethod) {
                    return c
                        ? function () {
                            return c.call(that, tgt, override, nativeMethod);
                        }
                        : function () {
                            return nativeMethod.apply(tgt, arguments);
                        };
                } (obj, target, callback, nativeProto[override]));
            }
        }

        return obj;
    }

    function noop() {
        return function () { };
    }

    function wrap(func, wrapper) {
        return function () {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    }

    // Extend our base object with our public methods
    extend(mdsol, {
        clone: clone,

        each: each,

        error: function (msg) {
            throw new Error(msg);
        },

        exists: exists,

        extend: extend,

        getType: getType,

        getValue: getValue,

        isArray: isArray,

        isDate: isDate,

        isEmpty: isEmpty,

        isFunction: isFunction,

        isNumber: isNumber,

        isObject: isObject,

        isOwn: isOwn,

        isPlainObject: isPlainObject,

        isString: isString,

        keys: keys,

        makeArray: makeArray,

        merge: merge,

        namespace: namespace,

        noop: noop,

        proxy: proxy,

        toArray: toArray,

        values: values,

        wrap: wrap
    });
});
