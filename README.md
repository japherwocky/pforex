USAGE
=====


LOAD
----

### Shopify:

    {{ "pforex.js" | asset_url | script_tag }}
 
### everywhere else
 
    <script src="/path/to/pforex.js"></script>


SET CURRENCY
------------

### w/ HTML:

    <select pforex-selector >
        <option val="USD">USD</option> 
        <option val="EUR">EUR</option> 
        <option val="GBP">GBP</option> 
        <option val="JPY">JPY</option> 
    </select>

<select pforex-selector >
    <option val="USD">USD</option> 
    <option val="EUR">EUR</option> 
    <option val="GBP">GBP</option> 
    <option val="JPY">JPY</option> 
</select>


### w/ URL parameters:

pforex looks for a `currency` parameter on the page's URL and sets it on
load, before falling back to a remembered cookie and then to `base`:

    <a href="/products/kettle?currency=JPY">See prices in yen</a>

Use this on links to make sure traffic lands on a page already showing the
right currency. If the page was loaded this way, changing the selector
afterward keeps `?currency=` in the address bar in sync -- see `syncQuery`
under CONFIGURATION -- so the URL stays something you can copy and send to
someone else.


### w/ Javascript:

    Pforex.set("USD")
    Pforex.get()



MARK DOM ELEMENTS TO BE WATCHED
-------------------------------

### DEFAULTS

#### use integers for prices

Prices are whole numbers in the base currency's smallest unit, so nothing is
stored as a float and nothing rounds twice.

    <pforex price="100" />

$1.00


#### the currency decides the decimal places, not the number

    <pforex price="399" />

$3.99

Set the currency to JPY, which has no minor unit, and the same tag renders
`¥640` with no decimal point at all.


#### and grouping

    <pforex price="500000" />

$5,000.00

Grouping follows the currency too: `kr5 000,00` in SEK, and `₹5,00,000.00`
in INR, which groups at the lakh rather than every three digits.


#### showing currency defaults to "false":

    <pforex price="500000" show-currency="true" />

$5,000.00 USD


#### showing the currency symbol defaults to "true":

    <pforex price="500000" show-symbol="false" />

5,000.00


#### Omit the price for labels:

    <pforex show-symbol="false" show-currency="true" />

USD


#### regex support for hairy situations

    <pforex price="10000" re="(.+?) GIFTCARD">N GIFTCARD</pforex>

$100.00 GIFTCARD

Only the first capture group is replaced, and the rest of the element is left
exactly as it was.



LEGACY CODE
-----------


### inject into pre-existing HTML with `data-pforex-*`:

    <span data-pforex-price="100" data-pforex-show-currency="true" class="money">
    </span> 



    <span 
        data-pforex-price="100" 
        data-pforex-re="\((.+?)\)" 
        class="money"
    >
    SPECIAL THING ($1)
    </span> 


DYNAMIC
------- 

### to change the price of an element, just change `price`

    <pforex id="dynamic-display" price="100" />

    <button id="clicker" >CLICK ME</button>

    <script>
        var button = document.querySelector('#clicker');
        var display = document.querySelector('#dynamic-display');

        button.addEventListener( 'click', function () {
            display.setAttribute('price', 
                (parseInt(display.getAttribute('price'))+1313) 
            );
        });
    </script>


CONFIGURATION
-------------

Everything has a working default; set these before or during `init()` if you
need something else.

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
stale prices rather than to an empty page.

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


DEVELOPING
----------

There are no runtime dependencies and no build required to use the readable
file. To regenerate the minified one after changing `static/pforex.js`:

    ./build.sh

The test suite is a page. Serve the repo root and open it:

    python -m http.server 8000
    # then http://localhost:8000/test/

Add `?min=1` to run the identical suite against `static/pforex.min.js`, which
is how a stale or broken minified build gets caught before it ships.
