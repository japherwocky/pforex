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


### w/ Javascript:

    Pforex.set("USD")
    Pforex.get()



MARK DOM ELEMENTS TO BE WATCHED
-------------------------------

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
