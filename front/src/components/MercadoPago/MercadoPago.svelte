<script>
    import { onMount } from 'svelte';
    export let totalCheckout = 0;
    let paymentForm, userHash, cardBrand, installments, cvv, expirationMonth, expirationYear, cardName, cardCPF, cardToken, paymentMethodId, userMail;
    let selectedInstallment = 1;
    let SDKIsReady = false;
    let cardNumber = '';
    let componentIsReady = false;
    let paymentStatus = 'Aguardando pagamento';
    let paymentMethods = [];

    onMount(() => componentIsReady = true);

    function SDKLoaded() {
        console.log('loaded')
        SDKIsReady = true;
    }

    $: if (SDKIsReady && componentIsReady) {
        Mercadopago.setPublishableKey('TEST-f4878fc9-a7db-4e55-b05c-bc58f41849bb');
        // Mercadopago.setPublishableKey('APP_USR-ca470e56-a6da-4b9d-b03e-75407e1f32ac');
        Mercadopago.getIdentificationTypes();
    }

    function guessPaymentMethod(event) {
        const cardNumberValue = event.target.value;
        if (!cardNumberValue) return;

        if (cardNumberValue.length > 16) {
            return cardNumber = cardNumberValue.slice(0, -1);
        }

        if (cardNumber.length >= 6) {
            let bin = cardNumber.substring(0, 6);
            window.Mercadopago.getPaymentMethod({
                "bin": bin
            }, setPaymentMethod);
        }
    };

    function handleSubmit() {
        window.Mercadopago.createToken(document.querySelector('#pay'), sdkResponseHandler);
    };

    function sdkResponseHandler(status, response) {
        if (status != 200 && status != 201) {
            console.log("verify filled data", response);
        } else { 
            cardToken = response.id;
            fetch('/mercadopago', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transaction_amount: parseFloat(totalCheckout),
                token: cardToken,
                description: 'Test Payment',
                installments: selectedInstallment,
                payment_method_id: paymentMethodId,
                payer: {
                    email: userMail
                }
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
            .catch(err => paymentStatus = err);

        }
    };

    function setPaymentMethod(status, response) {
        if (status == 200) {
            paymentMethodId = response[0].id;
            response[0].additional_info_needed.includes("issuer_id") ? getInstallments() : getIssuers(paymentMethodId);
        } else {
            console.log(`payment method info error: ${response}`);
        }
    }

    function getInstallments() {
        window.Mercadopago.getInstallments({
            "payment_method_id": paymentMethodId,
            "amount": totalCheckout

        }, function (status, response) {
            if (status == 200) {
                installments = response[0].payer_costs;
            } else {
                console.log(`installments method info error: ${response}`);
            }
        });
    }

    function getIssuers(paymentMethodId) {
   window.Mercadopago.getIssuers(
       paymentMethodId,
       setIssuers
   );
}

function setIssuers(status, response) {
   if (status == 200) {
       let issuerSelect = document.getElementById('issuer');
       response.forEach( issuer => {
           let opt = document.createElement('option');
           opt.text = issuer.name;
           opt.value = issuer.id;
           issuerSelect.appendChild(opt);
       });

       getInstallments(
           document.getElementById('paymentMethodId').value,
           document.getElementById('transactionAmount').value,
           issuerSelect.value
       );
   } else {
       console.log(`issuers method info error: ${response}`);
   }
}



</script>

<svelte:head>
    <script type="text/javascript" on:load={SDKLoaded}
        src="https://secure.mlstatic.com/sdk/javascript/beta/v1/mercadopago.js?version=1324232"></script>
    <!-- <script type="text/javascript" on:load={SDKLoaded}
        src="http://localhost:8000/mercadopago.debug.js"></script> -->
</svelte:head>
<a href="https://www.mercadopago.com.br/developers/pt/guides/payments/api/receiving-payment-by-card/"
    target="_blank">Documentação</a>
<a href="https://www.mercadopago.com.br/developers/panel/credentials/sandbox?id=2201614368810128"
    target="_blank">Sandbox dashboard</a>
<a href="https://www.mercadopago.com.br/developers/pt/guides/payments/api/testing/" target="_blank">valores de teste</a>
<div style="display: flex; align-items: center; flex-direction: column;">
    <form action="/mercadopago" method="post" id="pay" name="pay">
        <fieldset>
            <p>
                <label for="transaction_amount">Valor a pagar</label>
                <input name="transaction_amount" id="transaction_amount" disabled value={totalCheckout} />
            </p>
            <p>
                <label for="cardNumber">Número do cartão</label>
                <input on:keyup={guessPaymentMethod} on:change={guessPaymentMethod} bind:value={cardNumber} type="text" id="cardNumber" data-checkout="cardNumber"
                    onselectstart="return false" onCut="return false"
                    onDrag="return false" onDrop="return false" autocomplete=off />
                    <span>{paymentMethodId}</span>
            </p>
            <p>
                <label for="cardholderName">Nome e sobrenome</label>
                <input type="text" id="cardholderName" data-checkout="cardholderName" />
            </p>
            <p>
                <label for="cardExpirationMonth">Mês de vencimento</label>
                <input type="text" id="cardExpirationMonth" data-checkout="cardExpirationMonth"
                    onselectstart="return false" onpaste="return false" onCopy="return false" onCut="return false"
                    onDrag="return false" onDrop="return false" autocomplete=off />
            </p>
            <p>
                <label for="cardExpirationYear">Ano de vencimento</label>
                <input type="text" id="cardExpirationYear" data-checkout="cardExpirationYear"
                    onselectstart="return false" onpaste="return false" onCopy="return false" onCut="return false"
                    onDrag="return false" onDrop="return false" autocomplete=off />
            </p>
            <p>
                <label for="securityCode">Código de segurança</label>
                <input type="text" id="securityCode" data-checkout="securityCode" onselectstart="return false"
                    onpaste="return false" onCopy="return false" onCut="return false" onDrag="return false"
                    onDrop="return false" autocomplete=off />
            </p>
            {#if installments}
            <p>
                <label for="installments">Parcelas</label>
                <select bind:value={selectedInstallment} id="installments" class="form-control" name="installments">
                    {#each installments as installment}
                        <option value={installment.installments}>{installment.recommended_message}</option>
                    {/each}
                </select>
            </p>
            {/if}
            <p>
                <label for="docType">Tipo de documento</label>
                <select id="docType" data-checkout="docType"></select>
            </p>
            <p>
                <label for="docNumber">Número do documento</label>
                <input type="text" id="docNumber" data-checkout="docNumber" />
            </p>
            <p>
                <label for="email">E-mail</label>
                <input bind:value={userMail} type="email" id="email" name="email" placeholder="test@test.com" />
            </p>
            <p>
                <label for="issuer">E-mail</label>
                <select type="issuer" id="issuer" name="issuer" ></select>
            </p>
            <input type="hidden" name="transactionAmount" id="transactionAmount" value="100" />
            <input type="hidden" name="paymentMethodId" id="paymentMethodId" />
            <input type="hidden" name="description" id="description" />
            <input type="submit" on:click|preventDefault={handleSubmit} value="Pagar" />
        </fieldset>
    </form>
    <pre>
    <code>
      {JSON.stringify(paymentStatus,null, 4)}
    </code>
  </pre>

</div>

<style>

</style>