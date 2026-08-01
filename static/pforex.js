/*
 * pforex 0.4 -- easy foreign currencies
 * https://github.com/japherwocky/pforex
 *
 * Drop this in with a <script> tag and it converts and formats every price
 * on the page. It is deliberately dependency-free and framework-free: the
 * whole point is that it gets injected into storefront themes nobody on our
 * end has ever seen.
 */
(function (window, document) {
'use strict';

var Pforex = {

    version: '0.4',

    // Prices are authored in this currency, as integers in its smallest
    // unit (cents). `current` is what we are displaying right now.
    base: 'USD',
    current: 'USD',

    // Where to get exchange rates. Frankfurter serves the European Central
    // Bank's daily reference rates over CORS with no key and no signup, and
    // it hands back plain JSON -- which is the entire reason it replaced the
    // previous approach of fetching Shopify's currencies.js and eval'ing it.
    ratesUrl: 'https://api.frankfurter.dev/v1/latest?base=USD',

    // rates[X] is how many X one unit of `base` buys. Null until the fetch
    // lands; every render path checks before touching it.
    rates: null,

    // Rewrite ?currency= in the address bar when the currency changes. Off
    // unless the page was *loaded* with that parameter, in which case we
    // keep it honest so the URL stays shareable -- see init(). Set it true
    // to always rewrite.
    syncQuery: false,


    /* ---- lifecycle ---------------------------------------------------- */

    init: function (options) {
        var self = this;

        if (options) {
            Object.keys(options).forEach(function (key) {
                self[key] = options[key];
            });
        }

        this.mkSelector();

        // A currency named in the URL wins over a remembered one, and a URL
        // that named a currency keeps naming it as the reader changes it.
        var wanted = this.getParameterByName('currency');

        if (wanted && this.currencies[wanted]) {
            this.current = wanted;
            this.syncQuery = true;
        } else if (this.readCookie('pforex') && this.currencies[this.readCookie('pforex')]) {
            this.current = this.readCookie('pforex');
        }

        // Render immediately off the fallback table and again when the live
        // rates land. Waiting for the network first meant every price on the
        // page sat empty until the request came back.
        this.rates = this.fallbackRates;
        this.update();
        this.watch();

        this.data(function () { self.update(); });
    },

    // Fetch live rates, then hand back to the callback. A failure is not
    // fatal: we already rendered off the fallback table, so the page keeps
    // working with slightly stale numbers rather than breaking.
    data: function (done) {
        var self = this;

        if (!window.fetch) {
            return done && done();
        }

        window.fetch(this.ratesUrl)
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('pforex: rates request failed, ' + response.status);
                }
                return response.json();
            })
            .then(function (payload) {
                var rates = payload && payload.rates;

                if (!rates) {
                    throw new Error('pforex: no rates in response');
                }

                // The feed omits the base currency from its own table.
                rates[self.base] = 1;
                self.rates = rates;

                return done && done();
            })
            .catch(function (err) {
                if (window.console && console.warn) {
                    console.warn(err.message || err, '-- falling back to bundled rates');
                }
                return done && done();
            });
    },

    // Re-render when somebody changes a price attribute in place.
    watch: function () {
        var self = this;

        var observer = new MutationObserver(function (deltas) {
            deltas.forEach(function (d) { self.render(d.target); });
        });

        this.priced().forEach(function (el) {
            observer.observe(el, { attributes: true });
        });
    },


    /* ---- rendering ---------------------------------------------------- */

    render: function (el) {
        var self = Pforex;
        var currency = self.currencies[self.current];

        if (!currency || !self.rates) {
            return;
        }

        var attr = function (name) {
            return el.getAttribute(name) || el.getAttribute('data-pforex-' + name);
        };

        var out = '';

        // Currency symbol, ON by default.
        if (attr('show-symbol') !== 'false') {
            out += currency.symbol;
        }

        // The price itself. Omitting it entirely is legal and gives you a
        // bare label -- a legend, or a column header that follows the
        // selector -- so a missing attribute is not an error.
        var raw = attr('price');

        if (raw !== null && raw !== '') {
            var cents = parseInt(raw, 10);

            if (!isNaN(cents)) {
                out += self.separate(self.convert(cents), currency);
            }
        }

        // Currency code, OFF by default.
        if (attr('show-currency') === 'true') {
            out += (out.length ? ' ' : '') + self.current;
        }

        var pattern = attr('re');

        if (!pattern || el.innerHTML.length === 0) {
            // Nothing to preserve, so the element is just a container.
            el.innerHTML = out;
            return;
        }

        // The escape hatch: the price is buried in copy we do not control,
        // so swap the first capture group in place and leave the rest alone.
        var match = RegExp(pattern).exec(el.innerHTML);

        if (match && match[1]) {
            el.innerHTML = el.innerHTML.replace(match[1], out);
        }
    },

    // Cents in the base currency to a decimal amount in the current one.
    convert: function (cents) {
        var rate = this.rates[this.current] / this.rates[this.base];
        return (cents * rate) / 100;
    },

    // Format a number the way the target currency writes numbers: its own
    // decimal count, its own separators, its own digit grouping.
    separate: function (amount, currency) {
        var parts = amount.toFixed(currency.decimals).split('.');
        parts[0] = this.group(parts[0], currency);
        return parts.join(currency.decimalSep);
    },

    // Most currencies break every three digits. The Indian system groups the
    // last three and then pairs upward, so 100000 is 1,00,000.
    group: function (digits, currency) {
        if (currency.grouping === 'indian') {
            var head = digits.slice(0, -3);
            var tail = digits.slice(-3);

            if (!head) {
                return tail;
            }

            return head.replace(/\B(?=(\d{2})+(?!\d))/g, currency.thousandSep) +
                currency.thousandSep + tail;
        }

        return digits.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSep);
    },

    // Re-render everything and resync the selectors.
    update: function () {
        this.priced().forEach(this.render);

        this.all('select[pforex-selector]').forEach(function (el) {
            el.value = Pforex.current;
        });
    },


    /* ---- currency selection ------------------------------------------- */

    set: function (currency) {
        if (this.currencies[currency] === undefined) {
            if (window.console && console.warn) {
                console.warn('pforex: unknown currency', currency);
            }
            return this.current;
        }

        this.current = currency;
        this.writeCookie('pforex', currency);

        if (this.syncQuery) {
            this.writeParameter('currency', currency);
        }

        this.update();

        return this.current;
    },

    get: function () {
        return this.current;
    },

    // Any <select pforex-selector> on the page drives the currency, and they
    // all stay in step with each other through update().
    mkSelector: function () {
        this.all('select[pforex-selector]').forEach(function (el) {
            el.addEventListener('change', function (event) {
                Pforex.set(event.target.value);
            });
        });
    },


    /* ---- odds and ends ------------------------------------------------ */

    all: function (selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    },

    // Everything carrying a price, in either the tag spelling or the
    // attribute spelling we use for markup we cannot rewrite.
    priced: function () {
        return this.all('pforex, [data-pforex-price]');
    },

    getParameterByName: function (name) {
        var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
        return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
    },

    // replaceState rather than pushState: the reader flipping a currency
    // selector should not have to press Back four times to leave the page.
    writeParameter: function (name, value) {
        if (!window.history || !window.history.replaceState) {
            return;
        }

        var url = new URL(window.location.href);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url.toString());
    },

    readCookie: function (name) {
        var match = new RegExp('(?:^|; )' + name + '=([^;]*)').exec(document.cookie);
        return match ? decodeURIComponent(match[1]) : null;
    },

    writeCookie: function (name, value) {
        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);

        document.cookie = name + '=' + encodeURIComponent(value) +
            ';path=/;expires=' + expires.toUTCString();
    },


    /* ---- data ---------------------------------------------------------- */

    // How each currency writes a number. Symbol, how many decimal places it
    // actually uses, and what it separates digits with -- none of which are
    // derivable from the number itself.
    currencies: {
        USD: { symbol: '$',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        CAD: { symbol: '$',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        AUD: { symbol: '$',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        NZD: { symbol: '$',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        SGD: { symbol: '$',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        GBP: { symbol: '£',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        EUR: { symbol: '€',  decimals: 2, thousandSep: '.', decimalSep: ',' },
        CHF: { symbol: 'CHF', decimals: 2, thousandSep: '’', decimalSep: '.' },
        JPY: { symbol: '¥',  decimals: 0, thousandSep: ',', decimalSep: '.' },
        CNY: { symbol: '¥',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        SEK: { symbol: 'kr', decimals: 2, thousandSep: ' ', decimalSep: ',' },
        NOK: { symbol: 'kr', decimals: 2, thousandSep: '.', decimalSep: ',' },
        DKK: { symbol: 'kr', decimals: 2, thousandSep: '.', decimalSep: ',' },
        BRL: { symbol: 'R$', decimals: 2, thousandSep: '.', decimalSep: ',' },
        MXN: { symbol: '$',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        ILS: { symbol: '₪',  decimals: 2, thousandSep: ',', decimalSep: '.' },
        INR: { symbol: '₹',  decimals: 2, thousandSep: ',', decimalSep: '.', grouping: 'indian' },
        MYR: { symbol: 'RM', decimals: 2, thousandSep: ',', decimalSep: '.' },
    },

    // Enough to render a sensible page before the network answers, or if it
    // never does. Snapshot of ECB reference rates, 31 July 2026.
    fallbackRates: {
        USD: 1,      CAD: 1.4041, AUD: 1.4249, NZD: 1.5540, SGD: 1.2849,
        GBP: 0.74508, EUR: 0.8707, CHF: 0.8101, JPY: 160.24, CNY: 6.7513,
        SEK: 9.5651, NOK: 9.5272, DKK: 6.5087, BRL: 5.0583, MXN: 17.3715,
        ILS: 3.0574, INR: 95.39,  MYR: 4.2130,
    },

};


window.Pforex = Pforex;

// Wait for a DOM to walk. The script is injected into the <head> on some
// themes and just before </body> on others, and the old version assumed the
// second -- so on the first kind it found no prices and did nothing.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { Pforex.init(); });
} else {
    Pforex.init();
}

})(window, document);
