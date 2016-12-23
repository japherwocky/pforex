var Q = function (str) { return document.querySelectorAll(str)};

Pforex = {
    base: 'USD', // our base currency
    current: 'EUR', // currently chosen

    init: function () {


        // set up any select elements
        this.mkSelector();

        var on_data = function (success, error) {

            // check for existing choices from cookies
            if (Cookies.get('pforex') !== undefined) {
                Pforex.set(Cookies.get('pforex'));
            } else {
                Pforex.set('USD');
            }

            Pforex.update(); // kick off an initial render
            Pforex.watch(); // set observers on tags
        }

        // fetch current exchange data, then update prices
        this.data(on_data, on_data);

    },

    // set up DOMSubtreeModified handlers on specific tags
    watch: function() {
        var self = this;

        var observer = new MutationObserver( function(deltas) {
            // one or many changes
            deltas.forEach( function(d) {self.render(d.target)});
        })

        var watch_factory = function(element) {
            observer.observe(element, {attributes:true})
        }

        Q('[data-pforex-price]').forEach( watch_factory );
        Q('pforex').forEach( watch_factory );
    },
 
    render: function (el) {
        var self = Pforex;
 
        // get base price set on the element
        var price = parseInt( el.getAttribute('price') || el.getAttribute('data-pforex-price'));
        
        // convert to current currency
        price = price * self.rates[self.base] / self.rates[self.current];

        // set currency appropriate decimals
        var decimals = self.currencies[self.current].decimals;
        price = Math.round(price/100 * Math.pow(10, decimals)) / Math.pow(10, decimals);

        price = self.separate(price, self.currencies[self.current]);

        // create updated text
        var out = self.currencies[self.current].symbol + price;

        if ( (el.attributes['showcurrency'] || el.attributes['data-pforex-showcurrency']) !== undefined) {
            out = out + ' ' + Pforex.current;
        }

        // find places we should insert it
        var user_re = el.getAttribute('re') || el.getAttribute('data-pforex-re');

        if (el.innerHTML.length === 0 || user_re === null) {
            // if the element is empty, assume we need it
            el.innerHTML = out;
        } else {

            var inner = el.innerHTML;
            var re = RegExp(user_re,'g');

            var match = re.exec(inner);

            while ( match !== null && match.length > 1 ) {
                inner = inner.replace(match[1], out);
                match = re.exec(inner);
            }

            el.innerHTML = inner;

        }

    },


    // on a language update (or data), update the render_price on all our objs 
    update: function () {

        // render <pforex> tags
        Q('pforex').forEach( Pforex.render );

        // or legacy code we're injected into
        Q('[data-pforex-price]').forEach( Pforex.render );
       
        // sync selectors 
        Q('select[pforex-selector]').forEach( function(el) { 
            el.value = Pforex.current;
        })
    },


    // set handlers for any currency selectors
    mkSelector: function () {

        Q('select[pforex-selector]').forEach( function(el) { 

            // on change
            el.onchange = function(event) {
                Pforex.set(event.target.value); // this will also trigger an update()
            }
        })
    },


    // set the current currency, if it's valid
    set: function(currency) {

        // validate
        if (Pforex.currencies[currency] !== undefined) {
            Pforex.current = currency 
        } else {
            console.log('Attempting to set unknown currency:', currency);
        }

        // set cookie
        Cookies.set('pforex', Pforex.current);

        Pforex.update();

    },

    // getter for consistency
    get: function () { return Pforex.current },


    // load exchange data
    data: function (cb, err) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '//cdn.shopify.com/s/javascripts/currencies.js');
        xhr.onload = function() {
            if (xhr.status === 200) {
                // sorry, this will override the global Currency :(
                eval(xhr.responseText);
                Pforex.rates = Currency.rates;

                // run callback if it existed
                return cb ? cb() : false;

            } else {

                // something went wrong :(
                console.log('Pforex could not load currency data:', xhr);
                return err ? err() : false;
            };
        };
        
        xhr.send();    
        },


    separate: function (number, currency) {

        // regex from http://stackoverflow.com/questions/2901102/
        function sep(x) {
            var parts = x.toString().split(".");
            // TODO, some currencies like INR don't put separators every 3 places >.>
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
            return parts.join(currency.decimalSep);
        }

        return sep(number);
    },


    currencies: {

        'USD': {
                symbol:'$',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'CAD': {
                symbol:'$',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'EUR': {
                symbol: '&euro;',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'AUD': {
                symbol:'$',
                decimals: 2,
                thousandSep: ' ',
                decimalSep: '.',
                },

        'NZD': {
                symbol:'$',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'JPY': {
                symbol: '&#165;',
                decimals: 0,
                thousandSep: ',',
                decimalSep: '.',
                },

        'GBP': {
                symbol: '&pound;',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'INR': {
                symbol: '₹',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'SGD': {
                symbol: '$',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'MYR': {
                symbol: 'RM',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'SAR': {
                symbol: '﷼',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'AED': {
                symbol: 'د.إ',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'SEK': {
                symbol: 'kr',
                decimals: 2,
                thousandSep: ' ',
                decimalSep: ',',
                },

        'NOK': {
                symbol: 'kr',
                decimals: 2,
                thousandSep: '.',
                decimalSep: ',',
                },

        'DKK': {
                symbol: 'kr',
                decimals: 2,
                thousandSep: '.',
                decimalSep: ',',
                },

        'CLP': {
                symbol: '$',
                decimals: 0,
                thousandSep: '.',
                decimalSep: '.',
                },

        'MXN': {
                symbol: '$',
                decimals: 2,
                thousandSep: ',',
                decimalSep: '.',
                },

        'BRL': {
                symbol: '$',
                decimals: 2,
                thousandSep: '.',
                decimalSep: ',',
                },

        

    },

};


/*
 * Cookies.js - 1.2.4-pre (5Nov2016)
 * https://github.com/ScottHamper/Cookies
 *
 * This is free and unencumbered software released into the public domain.
 */
(function (global, undefined) {
    'use strict';

    var factory = function (window) {
        if (typeof window.document !== 'object') {
            throw new Error('Cookies.js requires a `window` with a `document` object');
        }

        var Cookies = function (key, value, options) {
            return arguments.length === 1 ?
                Cookies.get(key) : Cookies.set(key, value, options);
        };

        // Allows for setter injection in unit tests
        Cookies._document = window.document;

        // Used to ensure cookie keys do not collide with
        // built-in `Object` properties
        Cookies._cacheKeyPrefix = 'cookey.'; // Hurr hurr, :)
        
        Cookies._maxExpireDate = new Date('Fri, 31 Dec 9999 23:59:59 UTC');

        Cookies.defaults = {
            path: '/',
            secure: false
        };

        Cookies.get = function (key) {
            if (Cookies._cachedDocumentCookie !== Cookies._document.cookie) {
                Cookies._renewCache();
            }
            
            var value = Cookies._cache[Cookies._cacheKeyPrefix + key];

            return value === undefined ? undefined : decodeURIComponent(value);
        };

        Cookies.set = function (key, value, options) {
            options = Cookies._getExtendedOptions(options);
            options.expires = Cookies._getExpiresDate(value === undefined ? -1 : options.expires);

            Cookies._document.cookie = Cookies._generateCookieString(key, value, options);

            return Cookies;
        };

        Cookies.expire = function (key, options) {
            return Cookies.set(key, undefined, options);
        };

        Cookies._getExtendedOptions = function (options) {
            return {
                path: options && options.path || Cookies.defaults.path,
                domain: options && options.domain || Cookies.defaults.domain,
                expires: options && options.expires || Cookies.defaults.expires,
                secure: options && options.secure !== undefined ?  options.secure : Cookies.defaults.secure
            };
        };

        Cookies._isValidDate = function (date) {
            return Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime());
        };

        Cookies._getExpiresDate = function (expires, now) {
            now = now || new Date();

            if (typeof expires === 'number') {
                expires = expires === Infinity ?
                    Cookies._maxExpireDate : new Date(now.getTime() + expires * 1000);
            } else if (typeof expires === 'string') {
                expires = new Date(expires);
            }

            if (expires && !Cookies._isValidDate(expires)) {
                throw new Error('`expires` parameter cannot be converted to a valid Date instance');
            }

            return expires;
        };

        Cookies._generateCookieString = function (key, value, options) {
            key = key.replace(/[^#$&+\^`|]/g, encodeURIComponent);
            key = key.replace(/\(/g, '%28').replace(/\)/g, '%29');
            value = (value + '').replace(/[^!#$&-+\--:<-\[\]-~]/g, encodeURIComponent);
            options = options || {};

            var cookieString = key + '=' + value;
            cookieString += options.path ? ';path=' + options.path : '';
            cookieString += options.domain ? ';domain=' + options.domain : '';
            cookieString += options.expires ? ';expires=' + options.expires.toUTCString() : '';
            cookieString += options.secure ? ';secure' : '';

            return cookieString;
        };

        Cookies._getCacheFromString = function (documentCookie) {
            var cookieCache = {};
            var cookiesArray = documentCookie ? documentCookie.split('; ') : [];

            for (var i = 0; i < cookiesArray.length; i++) {
                var cookieKvp = Cookies._getKeyValuePairFromCookieString(cookiesArray[i]);

                if (cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] === undefined) {
                    cookieCache[Cookies._cacheKeyPrefix + cookieKvp.key] = cookieKvp.value;
                }
            }

            return cookieCache;
        };

        Cookies._getKeyValuePairFromCookieString = function (cookieString) {
            // "=" is a valid character in a cookie value according to RFC6265, so cannot `split('=')`
            var separatorIndex = cookieString.indexOf('=');

            // IE omits the "=" when the cookie value is an empty string
            separatorIndex = separatorIndex < 0 ? cookieString.length : separatorIndex;

            var key = cookieString.substr(0, separatorIndex);
            var decodedKey;
            try {
                decodedKey = decodeURIComponent(key);
            } catch (e) {
                if (console && typeof console.error === 'function') {
                    console.error('Could not decode cookie with key "' + key + '"', e);
                }
            }
            
            return {
                key: decodedKey,
                value: cookieString.substr(separatorIndex + 1) // Defer decoding value until accessed
            };
        };

        Cookies._renewCache = function () {
            Cookies._cache = Cookies._getCacheFromString(Cookies._document.cookie);
            Cookies._cachedDocumentCookie = Cookies._document.cookie;
        };

        Cookies._areEnabled = function () {
            var testKey = 'cookies.js';
            var areEnabled = Cookies.set(testKey, 1).get(testKey) === '1';
            Cookies.expire(testKey);
            return areEnabled;
        };

        Cookies.enabled = Cookies._areEnabled();

        return Cookies;
    };
    var cookiesExport = (global && typeof global.document === 'object') ? factory(global) : factory;

    // AMD support
    if (typeof define === 'function' && define.amd) {
        define(function () { return cookiesExport; });
    // CommonJS/Node.js support
    } else if (typeof exports === 'object') {
        // Support Node.js specific `module.exports` (which can be a function)
        if (typeof module === 'object' && typeof module.exports === 'object') {
            exports = module.exports = cookiesExport;
        }
        // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
        exports.Cookies = cookiesExport;
    } else {
        global.Cookies = cookiesExport;
    }
})(typeof window === 'undefined' ? this : window);

Pforex.init();
