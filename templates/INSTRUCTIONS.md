INSTALLATION
------------

Head over to the [Shopify app store](https://apps.shopify.com/pforex) and hit the giant green GET button!


CURRENCY SELECTION
------------------
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


CUSTOMIZE PRICE DISPLAY
-----------------------
You'll need to let Pforex know which items on your page are prices!

To start, especially if your theme doesn't have a lot of customization,
go into your general settings (https://yourshop.myshopify.com/admin/settings/general), 
and click "Change Formatting".

Under "Currency Formatting", set "HTML with currency" to:

    <pforex price=${{amount}} show-currency=true />

and "HTML without currency" to:

    <pforex price=${{amount}} />

__CAREFUL__: _Do not use quotation marks_ after `price` or `show-currency`, this _will break_ the code.


### DEFAULTS

#### use integers for prices

    <pforex price="100" />

$1


#### decimals will show up if appropriate

    <pforex price="399" />

$3.99


#### and commas

    <pforex price="500000" />

$5,000


#### showing currency defaults to "false":

    <pforex price="500000" show-currency="true" />

$5,000 USD


#### showing the currency symbol defaults to "true":

    <pforex price="500000" show-symbol="false" />

5,000


#### Omit the price for labels:

    <pforex show-symbol="false" show-currency="true" />

USD


#### regex support for hairy situations

    <pforex price="10000" re="(.+?) GIFTCARD">N GIFTCARD</pforex>

$100 GIFTCARD



LEGACY CODE
-----------


### inject into pre-existing HTML with `data-pforex-*`:

    <span data-pforex-price="100" data-pforex-showcurrency="true" class="money">
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
