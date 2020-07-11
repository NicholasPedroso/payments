<script>
    import { onMount } from 'svelte';
    export let totalCheckout = 0;
    let squareIsReady = false;
    let componentIsReady = false;
    let paymentForm;
    let paymentStatus = 'Aguardando pagamento';
    onMount(() => componentIsReady = true);

    function squareLoaded() {
        console.log('loaded')
        squareIsReady = true;
    }

    function requestCardNonce(event) {

        // Don't submit the form until SqPaymentForm returns with a nonce
        event.preventDefault();
        // Request a nonce from the SqPaymentForm object
        paymentForm.requestCardNonce();
    }

    $: if (squareIsReady && componentIsReady) {
        paymentForm = new SqPaymentForm({

        // Initialize the payment form elements
        applicationId: 'sandbox-sq0idb-MuKSSoEpsI13yKJL6Bk8aQ',
        locationId: 'YWAF7YQR0KV8A',
        inputClass: 'sq-input',
        autoBuild: false,

        // Customize the CSS for SqPaymentForm iframe elements
        inputStyles: [{
            fontSize: '16px',
            fontFamily: 'Helvetica Neue',
            padding: '16px',
            color: '#373F4A',
            backgroundColor: 'transparent',
            lineHeight: '24px',
            placeholderColor: '#CCC',
            _webkitFontSmoothing: 'antialiased',
            _mozOsxFontSmoothing: 'grayscale'
        }],

        // Initialize Apple Pay placeholder ID
        applePay: false,

        // Initialize Masterpass placeholder ID
        masterpass: false,

        // Initialize the credit card placeholders
        cardNumber: {
            elementId: 'sq-card-number',
            placeholder: '• • • •  • • • •  • • • •  • • • •'
        },
        cvv: {
            elementId: 'sq-cvv',
            placeholder: 'CVV'
        },
        expirationDate: {
            elementId: 'sq-expiration-date',
            placeholder: 'MM/YY'
        },
        postalCode: {
            elementId: 'sq-postal-code',
            placeholder: '12345'
        },

        // SqPaymentForm callback functions
        callbacks: {
            /*
            * callback function: createPaymentRequest
            * Triggered when: a digital wallet payment button is clicked.
            * Replace the JSON object declaration with a function that creates
            * a JSON object with Digital Wallet payment details
            */
            createPaymentRequest: function () {

                return {
                    requestShippingAddress: false,
                    requestBillingInfo: true,
                    currencyCode: "USD",
                    countryCode: "US",
                    total: {
                    label: "MERCHANT NAME",
                    amount: "100",
                    pending: false
                    },
                    lineItems: [
                    {
                        label: "Subtotal",
                        amount: "100",
                        pending: false
                    }
                    ]
                }
            },

            /*
            * callback function: cardNonceResponseReceived
            * Triggered when: SqPaymentForm completes a card nonce request
            */
            cardNonceResponseReceived: function (errors, nonce, cardData) {
                console.log('cardnonce received')
                if (errors) {
                    // Log errors from nonce generation to the Javascript console
                    console.log("Encountered errors:");
                    errors.forEach(function (error) {
                    console.log('  ' + error.message);
                    console.log(error.message);
                    });

                    return;
                }
                fetch('/square', {
                    method: 'POST',
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      nonce: nonce,
                      amount_money: {
                        "amount": totalCheckout,
                        "currency": "USD"
                      },
                    })
                })
                .catch(err => {
                    console.log('Network error: ' + err);
                })
                .then(response => {
                    if (!response.ok) {
                    return response.json().then(errorInfo => Promise.reject(errorInfo)); //UPDATE HERE
                    }
                    return response.json(); //UPDATE HERE
                })
                .then(data => paymentStatus = data)
                .catch(err => paymentStatus = JSON.parse(err.result));

            },

            /*
            * callback function: unsupportedBrowserDetected
            * Triggered when: the page loads and an unsupported browser is detected
            */
            unsupportedBrowserDetected: function () {
                console.log('browser nao suportado para pagmento')
            /* PROVIDE FEEDBACK TO SITE VISITORS */
            },

            /*
            * callback function: inputEventReceived
            * Triggered when: visitors interact with SqPaymentForm iframe elements.
            */
            inputEventReceived: function (inputEvent) {
                switch (inputEvent.eventType) {
                    case 'focusClassAdded':
                        console.log('Focus ativo no campo ', inputEvent.field)
                    break;
                    case 'focusClassRemoved':
                        console.log('Focus saiu')
                    break;
                    case 'errorClassAdded':
                    document.getElementById("error").innerHTML = "Arrume os erros e continue";
                    break;
                    case 'errorClassRemoved':
                    /* HANDLE AS DESIRED */
                    document.getElementById("error").style.display = "none";
                    break;
                    case 'cardBrandChanged':
                        console.log('Bandeira do cartão mudou')
                    break;
                    case 'postalCodeChanged':
                        console.log('ZIPCODE mudou')
                    break;
                }
            },

            /*
            * callback function: paymentFormLoaded
            * Triggered when: SqPaymentForm is fully loaded
            */
            paymentFormLoaded: function () {
            /* HANDLE AS DESIRED */
            console.log("The form loaded!");
            }
        }
        });
        if (SqPaymentForm.isSupportedBrowser()) {
            paymentForm.build();
        }
    }

</script>

<svelte:head>
        <!-- link to the SqPaymentForm library -->
        <script type="text/javascript" on:load={squareLoaded} src="https://js.squareupsandbox.com/v2/paymentform">
        </script>
    

</svelte:head>
<a href="https://developer.squareup.com/docs/payment-form/overview" target="_blank">Documentação</a>
<a href="https://squareupsandbox.com/dashboard/sales/transactions" target="_blank">Sandbox dashboard</a>
<a href="https://developer.squareup.com/docs/testing/test-values#client-side-testing" target="_blank">valores de teste</a>
<div style="display: flex; align-items: center; flex-direction: column;">
    <div id="form-container">
        <div id="sq-ccbox">
          <!--
            Be sure to replace the action attribute of the form with the path of
            the Transaction API charge endpoint URL you want to POST the nonce to
            (for example, "/process-card")
          -->
          <form id="nonce-form" novalidate action="PATH/TO/PAYMENT/PROCESSING/PAGE" method="post">
            <fieldset>
              <span class="label">Card Number</span>
              <div id="sq-card-number"></div>
      
              <div class="third">
                <span class="label">Expiration</span>
                <div id="sq-expiration-date"></div>
              </div>
      
              <div class="third">
                <span class="label">CVV</span>
                <div id="sq-cvv"></div>
              </div>
      
              <div class="third">
                <span class="label">Postal</span>
                <div id="sq-postal-code"></div>
              </div>
            </fieldset>
      
            <button id="sq-creditcard" class="button-credit-card" on:click|stopPropagation="{requestCardNonce}">Pagar ${totalCheckout}</button>
      
            <div id="error"></div>
      
            <!--
              After a nonce is generated it will be assigned to this hidden input field.
            -->
            <input type="hidden" id="card-nonce" name="nonce">
          </form>
        </div> <!-- end #sq-ccbox -->
      
      </div> <!-- end #form-container -->

      <pre>
        <code>
          {JSON.stringify(paymentStatus,null, 4)}
        </code>
      </pre>
      
</div>

<style>
    * {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body, html {
  color: #373F4A;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-weight: normal;
  height: 100%;
}

iframe {
  margin: 0;
  padding: 0;
  border: 0;
}

button {
  border: 0;
}

hr {
  height: 1px;
  border: 0;
  background-color: #CCC;
}

fieldset {
  margin: 0;
  padding: 0;
  border: 0;
}


#form-container {
  position: relative;
  width: 380px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.5;
  text-transform: uppercase;
}

.third {
  float: left;
  width: calc((100% - 32px) / 3);
  padding: 0;
  margin: 0 16px 16px 0;
}

.third:last-of-type {
  margin-right: 0;
}

/* Define how SqPaymentForm iframes should look */
.sq-input {
  box-sizing: border-box;
  border: 1px solid #E0E2E3;
  border-radius: 4px;
  outline-offset: -2px;
  display: inline-block;
  -webkit-transition: border-color .2s ease-in-out, background .2s ease-in-out;
     -moz-transition: border-color .2s ease-in-out, background .2s ease-in-out;
      -ms-transition: border-color .2s ease-in-out, background .2s ease-in-out;
          transition: border-color .2s ease-in-out, background .2s ease-in-out;
}

/* Define how SqPaymentForm iframes should look when they have focus */
.sq-input--focus {
  border: 1px solid #4A90E2;
  background-color: rgba(74,144,226,0.02);
}


/* Define how SqPaymentForm iframes should look when they contain invalid values */
.sq-input--error {
  border: 1px solid #E02F2F;
  background-color: rgba(244,47,47,0.02);
}

#sq-card-number {
  margin-bottom: 16px;
}

/* Customize the "Pay with Credit Card" button */
.button-credit-card {
  width: 100%;
  height: 56px;
  margin-top: 10px;
  background: #4A90E2;
  border-radius: 4px;
  cursor: pointer;
  display: block;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: 0;
  text-align: center;
  -webkit-transition: background .2s ease-in-out;
     -moz-transition: background .2s ease-in-out;
      -ms-transition: background .2s ease-in-out;
          transition: background .2s ease-in-out;
}

.button-credit-card:hover {
  background-color: #4281CB;
}


#error {
  width: 100%;
  margin-top: 16px;
  font-size: 14px;
  color: red;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
}

</style>