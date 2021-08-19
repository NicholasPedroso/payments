<script>
  import { onMount } from "svelte";
  export let chartProducts = [];
  let SDKIsReady = false;
  let SDKIsReadyHostedFields = false;
  let componentIsReady = false;
  let paymentForm;
  let paymentStatus = "Aguardando pagamento";
  onMount(() => (componentIsReady = true));

  function SDKLoaded() {
    console.log("client loaded");
    SDKIsReady = true;
  }
  function SDKLoadedHostedFields() {
    console.log("hosted field loaded");
    SDKIsReadyHostedFields = true;
  }

  $: if (SDKIsReady && SDKIsReadyHostedFields && componentIsReady) {
    fetch("/braintree/client_token")
      .then((response) => response.text())
      .then((clientAuthorization) => {
        braintree.client.create(
          {
            authorization: clientAuthorization,
          },
          function (clientErr, clientInstance) {
            if (clientErr) {
              console.error(clientErr);
              return;
            }

            braintree.hostedFields.create(
              {
                client: clientInstance,
                styles: {
                  input: {
                    "font-size": "14px",
                  },
                  "input.invalid": {
                    color: "red",
                  },
                  "input.valid": {
                    color: "green",
                  },
                },
                fields: {
                  number: {
                    container: "#card-number",
                    placeholder: "4111 1111 1111 1111",
                  },
                  cvv: {
                    container: "#cvv",
                    placeholder: "123",
                  },
                  expirationDate: {
                    container: "#expiration-date",
                    placeholder: "10/2022",
                  },
                },
              },
              function (hostedFieldsErr, hostedFieldsInstance) {
                if (hostedFieldsErr) {
                  console.error(hostedFieldsErr);
                  return;
                }

                var form = document.querySelector("#my-sample-form");
                var submit = document.querySelector('input[type="submit"]');

                submit.removeAttribute("disabled");

                form.addEventListener(
                  "submit",
                  function (event) {
                    event.preventDefault();

                    hostedFieldsInstance.tokenize(function (
                      tokenizeErr,
                      payload
                    ) {
                      if (tokenizeErr) {
                        console.error(tokenizeErr);
                        return;
                      }

                      // If this was a real integration, this is where you would
                      // send the nonce to your server.
                      console.log("Got a nonce: " + payload.nonce);
                    });
                  },
                  false
                );
              }
            );
          }
        );
      });
  }
</script>

<svelte:head>
  <script
    type="text/javascript"
    on:load={SDKLoaded}
    src="https://js.braintreegateway.com/web/3.80.0/js/client.min.js"></script>
  <script
    type="text/javascript"
    on:load={SDKLoadedHostedFields}
    src="https://js.braintreegateway.com/web/3.80.0/js/hosted-fields.min.js"></script>
</svelte:head>
<div style="display: flex; align-items: center; flex-direction: column;">
  <form action="/" id="my-sample-form" method="post">
    <label for="card-number">Card Number</label>
    <div id="card-number" />

    <label for="cvv">CVV</label>
    <div id="cvv" />

    <label for="expiration-date">Expiration Date</label>
    <div id="expiration-date" />

    <input type="submit" value="Pay" disabled />
  </form>

  <pre>
    <code>
      {JSON.stringify(paymentStatus,null, 4)}
    </code>
  </pre>
</div>

<style>
</style>
