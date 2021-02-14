<script>
    import { onMount } from 'svelte';
    export let totalCheckout = 0;
    let SDKIsReady = false;
    let componentIsReady = false;
    let cardNumberValue = "";
    let installments = "";
    let cardForm;

    onMount(() => componentIsReady = true);

    function SDKLoaded() {
        console.log('loaded')
        SDKIsReady = true;
    }

    $: if (SDKIsReady && componentIsReady) {
        initCardForm()
    }

    function initCardForm() {
        const mp = new MercadoPago('TEST-c288f7a5-31ad-4d54-8a26-cdec812dc2f2', {
            locale: 'pt-BR',
        });
        mp.getIdentificationTypes().then(id => console.log(id))

        cardForm = mp.cardForm({
            amount: 1000,
            autoMount: true,
            processingMode: 'aggregator',
            form: {
                id: 'pay',
                cardholderName: {
                    id: 'cardName',
                    placeholder: 'Full name',
                },
                cardNumber: {
                    id: 'cardNumber',
                    placeholder: 'Card number',
                },
                CVV: {
                    id: 'CVV',
                    placeholder: 'CVV',
                },
                installments: {
                    id: 'installments',
                    placeholder: 'Total installments'
                },
                expirationMonth: {
                    id: 'expirationMonth',
                    placeholder: 'MM'
                },
                expirationYear: {
                    id: 'expirationYear',
                    placeholder: 'YYYY'
                },
                docType: {
                    id: 'docType',
                    placeholder: 'Document type'
                },
                docValue: {
                    id: 'docValue',
                    placeholder: 'Document number'
                },
                issuer: {
                    id: 'issuer',
                    placeholder: 'Issuer'
                }
            },
            callbacks: {
                onFormMounted: function (error) {
                    if (error) console.log('Callback handling error ', error)
                },
                onFormUnmounted: function (error) {
                    if (error) return console.log('Callback handling error ', error)
                    console.log('aeeee desmontou')
                },
                onIdentificationTypesReceived: function (error, identificationTypes) {
                    if (error) console.log('Callback handling error ', error)
                },
                onPaymentMethodsReceived: function (error, paymentMethods) {
                    if (error) console.log('Callback handling error ', error)
                },
                onIssuersReceived: function (error, token) {
                    if (error) console.log('Callback handling error ', error)
                },
                onInstallmentsReceived: function (error, received) {
                    if (error) console.log('Callback handling error ', error)
                    console.log('nick', received)
                    installments = 'nick'
                    installments = received.payer_costs[0].installments
                },
                onCardTokenReceived: function (error, token) {
                    if (error) console.log('Callback handling error ', error)
                },
            }
        })

    }

    function handleSubmit() {
        cardForm.createCardToken().then(function (token) {
            cardForm.getCardFormData().then(function (data) {
                console.log('form Data: ', data)
                // fetch data to your backend
            })
        })
    }

    function handleInstallments(e) {
        installments = e.target.value;
    }

    function handleCardNumberChange(e) {
        cardNumberValue = e.target.value
        console.log('modifiquei o cardNumberValue ', cardNumberValue)
    }


</script>

<svelte:head>
    <!-- <script type="text/javascript" on:load={SDKLoaded} src="https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js"></script> -->
    <!-- <script type="text/javascript" on:load={SDKLoaded} src="https://beta-sdk.mercadopago.com/js/v2"></script> -->
    <script type="text/javascript" on:load={SDKLoaded} src="http://localhost:9000/sdk-default.dev.js"></script>
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
                <input on:keyup={handleCardNumberChange} type="text" value={cardNumberValue} id="cardNumber" />
            </p>
            <p>
                <label for="cardholderName">Nome e sobrenome</label>
                <input type="text" id="cardName" />
            </p>
            <p>
                <label for="cardExpirationMonth">Mês de vencimento</label>
                <input type="text" id="expirationMonth" />
            </p>
            <p>
                <label for="cardExpirationYear">Ano de vencimento</label>
                <input type="text" id="expirationYear" />
            </p>
            <p>
                <label for="securityCode">Código de segurança</label>
                <input type="text" id="CVV" />
            </p>

            <p>
                <label for="installments">Parcelas {installments}</label>
                <select value={installments} on:change={handleInstallments} id="installments" class="form-control"
                    name="installments"></select>
            </p>
            <p>
                <label for="docType">Tipo de documento</label>
                <select id="docType"></select>
            </p>
            <p>
                <label for="docNumber">Número do documento</label>
                <input type="text" id="docValue" />
            </p>
            <p>
                <label for="issuer">Emissor</label>
                <select type="text" id="issuer"></select>
            </p>
            <p>
                <label for="email">E-mail</label>
                <input type="email" id="email" name="email" placeholder="test@test.com" />
            </p>
            <button type="submit" on:click|preventDefault={handleSubmit} value="Pagar" />
        </fieldset>
    </form>
    <pre>
    <code>
    </code>
  </pre>

</div>

<style>

</style>