pforex
======

Easy foreign currencies. Drop one script tag onto a page and every price on
it converts and formats itself for whatever currency the reader picks.

    <script src="/path/to/pforex.js"></script>
    <pforex price="1899"></pforex>

There is a live demo at <https://pearachute.com/pforex>.

No dependencies, no build step, no framework. That is not minimalism for its
own sake -- it was written to be injected into storefront themes nobody on
our end would ever see, and the same constraint applies to any page you don't
own: a legacy template nobody wants to reopen, markup a CMS controls, a
stylesheet that is load-bearing and undocumented.


IT CAN'T BREAK YOUR LAYOUT
--------------------------

This is the part that makes it safe to drop into a page you didn't write.

A stylesheet has no rule for `<pforex>` -- nobody writes CSS for a tag that
didn't exist when they wrote it -- so the element matches nothing, stays
`display: inline`, inherits its parent's font and color, and contributes no
box of its own. It takes up exactly as much of the page as the text inside
it. Styling it is something you have to opt into.

When even an unknown tag is too much -- a CMS that strips elements it doesn't
recognize, a validator someone actually reads -- put the `data-pforex-*`
attributes on the element that is already there instead. Every selector that
matched it before still matches it; adding an attribute is invisible to CSS.

And when the element has contents worth keeping, the `re` attribute swaps a
single matched substring and leaves the surrounding markup standing. All
three are covered below.


ALWAYS CLOSE THE TAG
--------------------

Write `<pforex ...></pforex>`, never `<pforex ... />`.

HTML has a fixed list of self-closing elements and `pforex` is not on it, so
a parser ignores that trailing slash and leaves the tag **open** -- it then
swallows everything after it as its own children:

    <pforex price="100" />Free shipping over <b>$50</b>!

parses as

    <pforex price="100">Free shipping over <b>$50</b>!</pforex>

and since pforex replaces the contents of a tag it renders into, that
sentence is destroyed the moment the price renders. Close the tag and the
problem disappears. (Earlier versions of these docs used `/>` throughout,
which was wrong.)


LOAD
----

### everywhere

    <script src="/path/to/pforex.js"></script>

### Shopify

    {{ "pforex.js" | asset_url | script_tag }}

Shopify also lets a merchant set the template every price renders through,
shop-wide, under Settings -> General -> Change Formatting. Putting a pforex
tag in that one field means every price the platform emits -- product pages,
cart, search results, theme sections nobody wrote -- arrives already marked
up, without touching the theme. See `templates/INSTRUCTIONS.md`.


MARKING PRICES
--------------

Prices are whole numbers in the base currency's smallest unit, so nothing is
stored as a float and nothing rounds twice. `1899` is $18.99.

    <pforex price="1899"></pforex>

$18.99

### showing the currency code -- off by default

    <pforex price="500000" show-currency="true"></pforex>

$5,000.00 USD

### showing the symbol -- on by default

    <pforex price="500000" show-symbol="false"></pforex>

5,000.00

### omit the price for a bare label

Useful for a legend, or a column header that follows the selector.

    <pforex show-symbol="false" show-currency="true"></pforex>

USD


FORMATTING
----------

How a number is written is a property of the currency, not of the number.
pforex carries a table of symbol, decimal places, digit grouping and
separators, and applies whichever belongs to the currency on display.

The same amount, formatted by five different sets of rules:

| currency | rendered           |
| -------- | ------------------ |
| USD      | `$1,234,567.80`    |
| EUR      | `€1.234.567,80`    |
| SEK      | `kr1 234 567,80`   |
| JPY      | `¥1,234,568`       |
| INR      | `₹12,34,567.80`    |

JPY has no minor unit, so it takes no decimal places at all and rounds to
whole yen. INR groups at the lakh rather than every three digits. EUR swaps
the roles of `.` and `,` outright, and SEK separates with a space.


MARKUP YOU DON'T CONTROL
------------------------

The tag assumes you can write the markup. Often you can't: the price is
already sitting inside somebody else's template, and the most you can do is
add an attribute.

### `data-pforex-*` on an element that already exists

Every attribute has a `data-pforex-` spelling. The element stays exactly what
it was, so every CSS rule and every script that targeted it still works.

    <span data-pforex-price="100" data-pforex-show-currency="true" class="money"></span>

$1.00 USD

### `re` to rewrite in place

When the element has contents worth keeping, give it a pattern. Only the
first capture group is replaced; everything around it -- including any nested
markup -- is left exactly as it was.

    <pforex price="10000" re="(.+?) GIFTCARD">N GIFTCARD</pforex>

$100.00 GIFTCARD

    <span data-pforex-price="100" data-pforex-re="\((.+?)\)" class="money">
        SPECIAL THING ($1)
    </span>

SPECIAL THING ($1.00)


SETTING THE CURRENCY
--------------------

Three ways in, in descending priority: an explicit `?currency=` on the URL, a
returning visitor's remembered cookie, then a per-subdomain default. Whatever
wins, a reader who has already made a choice is never overridden.

### with a `<select>`

Add `pforex-selector` to any select element -- including one your theme
already has. Multiple selectors on a page stay in step with each other.

    <select pforex-selector>
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="GBP">GBP</option>
        <option value="JPY">JPY</option>
    </select>

### with a URL parameter

pforex reads a `currency` parameter off the page URL on load:

    <a href="/products/kettle?currency=JPY">See prices in yen</a>

Use it on links so traffic lands already showing the right currency. If the
page was loaded that way, changing the selector afterward keeps `?currency=`
in the address bar in sync -- see `syncQuery` -- so the URL stays something
worth copying and sending on.

### from JavaScript

    Pforex.set("USD")   // returns the currency actually set
    Pforex.get()        // "USD"

`set()` refuses a currency it doesn't have a formatting entry for, warns on
the console, and leaves the current one alone.


CHANGING A PRICE AFTER RENDER
-----------------------------

Change the `price` attribute and pforex re-renders that element. It watches
with a MutationObserver, so nothing needs to be notified.

    <pforex id="dynamic-display" price="100"></pforex>
    <button id="clicker">CLICK ME</button>

    <script>
        var button = document.querySelector('#clicker');
        var display = document.querySelector('#dynamic-display');

        button.addEventListener('click', function () {
            display.setAttribute('price',
                (parseInt(display.getAttribute('price'), 10) + 1313)
            );
        });
    </script>


CONFIGURATION
-------------

Everything has a working default; pass these to `init()` if you need
something else.

    Pforex.init({
        base: 'USD',              // what your prices are authored in
        ratesUrl: '/rates.json',  // where to fetch exchange rates
        syncQuery: true,          // keep ?currency= in the URL up to date
    });

### `base`

The currency your `price` integers are written in. Prices are in that
currency's smallest unit -- cents for USD, but note that JPY has no minor
unit, so a JPY base means whole yen.

### `ratesUrl`

Any endpoint returning `{"rates": {"EUR": 0.87, ...}}`, where each value is
how many of that currency one unit of `base` buys. Defaults to the European
Central Bank's daily reference rates by way of Frankfurter, which needs no
key and sends CORS headers.

If the request fails, pforex warns on the console and carries on with a small
table of bundled fallback rates, so a dead endpoint degrades to slightly
stale prices rather than to an empty page. Prices render off that table
immediately on load and re-render when the live rates arrive, so nothing sits
blank waiting for the network.

### `syncQuery`

Whether changing the currency rewrites `?currency=` in the address bar. Off
by default, on automatically if the page was *loaded* with that parameter --
so a link that specifies a currency stays accurate as the reader changes it,
and a page that never mentioned one is left alone. Uses `replaceState`, so it
does not fill up the Back button.

### `domains`

A default currency per subdomain, for a storefront that runs a language or
region on its own subdomain and wants the currency to follow it:

    Pforex.init({
        domains: {
            root: 'yourshop.com',
            subs: { en: 'USD', fr: 'EUR', jp: 'JPY' },
        },
    });

`fr.yourshop.com` then defaults to EUR with no cookie or query parameter
needed. This is the lowest-priority default of the three -- an explicit
`?currency=` or a returning visitor's remembered cookie both win over it, so
a reader who has already made a choice never gets overridden by which
subdomain they happened to land on.


REQUIREMENTS
------------

A browser with `MutationObserver`, which rules out Internet Explorer and
nothing else in current use. Live rates additionally need `fetch` and
promises; without them pforex skips the request and renders off its bundled
fallback table rather than failing.


DEVELOPING
----------

There are no runtime dependencies and nothing to build in order to *use* the
library -- `static/pforex.js` is the shipped artifact and it is plain,
readable JavaScript. The tooling below is only for working on it.

    npm install     # playwright and terser, dev only
    npm test        # run the suite headlessly against both builds
    ./build.sh      # regenerate static/pforex.min.js

### the test suite

It is a page, so it stays readable and debuggable in a browser. Serve the
repo root and open it:

    python -m http.server 8000
    # then http://localhost:8000/test/

Add `?min=1` to run the identical suite against `static/pforex.min.js`. That
is how a stale or broken minified build gets caught -- it has drifted from
the source before.

`npm test` does exactly this without a browser window: it serves the repo,
loads the page in headless Chromium, runs it against both builds, and fails
on any failed assertion or console error. CI runs it on every push, along
with a check that the committed `pforex.min.js` still matches a fresh build.
