INSTALLATION
============

Head over to the [Shopify app store](https://apps.shopify.com/pforex) and hit the giant green GET button!


CURRENCY SELECTION
==================
There are three ways to dynamically change the currency the page is displaying.



### w/ HTML:

To set up a widget on your page, use a regular `<select>`:

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

You might already have something that looks like this in your page.  Just add the `pforex-selector` attribute to use it.

If you have multiple widgets on a page, Pforex will handle keeping them synced up!

<select pforex-selector >
    <option val="USD">USD</option> 
    <option val="EUR">EUR</option> 
    <option val="GBP">GBP</option> 
    <option val="JPY">JPY</option> 
</select>


### w/ URL parameters:

Pforex can also look for a `currency` parameter in the page's URL.  

Use this with links to make sure traffic lands on a page displaying the right currency. 

    <a href="/installation?currency=JPY">
        Load this page with the Japanese Yen
    </a>

<a href="/installation?currency=JPY">Load this page with the Japanese Yen</a>


### w/ Javascript:

Need to make Pforex work with another app or custom JavaScript?  No problem!

You can manually set the currency (try it in your console on this page):

    Pforex.set("USD")

Or get the currently displayed currency:

    Pforex.get()


### DEFAULTS

Using pforex can be as simple as adding a snippet into your templates.

    <pforex price="100" />

<pforex price="100" />


#### decimals will show up if appropriate

    <pforex price="399" />

<pforex price="399" />


#### and commas

    <pforex price="500000" />

<pforex price="500000" />


#### showing currency defaults to "false":

    <pforex price="500000" show-currency="true" />

<pforex price="500000" show-currency="true" />


#### showing the currency symbol defaults to "true":

    <pforex price="500000" show-symbol="false" />

<pforex price="500000" show-symbol="false" />


#### Omit the price for labels:

    <pforex show-symbol="false" show-currency="true" />

<pforex show-symbol="false" show-currency="true" />


#### regex support

Sometimes you may not be able to cleanly wrap the text of the currency element.

Use `re` and a regex pattern to show pforex where to insert the price.


    <pforex price="10000" re="(.+?) GIFTCARD">N GIFTCARD</pforex>

<pforex price="10000" re="(N) GIFTCARD">N GIFTCARD</pforex>



#### Integration with legacy templates:

You can also blend pforex into Legacy code, or situations where you can't create a `<pforex>` element,
by using `data-pforex-*`.

    <span data-pforex-price="499"></span>

<span data-pforex-price="499"></span>


Combine with regex patterns, you can tackle tricky situations.  

Maybe you have a select box full of products that have prices in the title:

    <select>
        <option data-pforex-price="500" data-pforex-re="(.+) GIFTCARD">$5 GIFTCARD</option>
        <option data-pforex-price="1000" data-pforex-re="(.+) GIFTCARD">$10 GIFTCARD</option>
        <option data-pforex-price="1500" data-pforex-re="(.+) GIFTCARD">$15 GIFTCARD</option>
    </select>

<select>
    <option data-pforex-price="500" data-pforex-re="(.+) GIFTCARD">$5 GIFTCARD</option>
    <option data-pforex-price="1000" data-pforex-re="(.+) GIFTCARD">$10 GIFTCARD</option>
    <option data-pforex-price="1500" data-pforex-re="(.+) GIFTCARD">$15 GIFTCARD</option>
</select>



#### Integration with legacy JavaScript:

To change the price of something, just change the `price` attribute.

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



