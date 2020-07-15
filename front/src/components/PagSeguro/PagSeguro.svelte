<script>
    import { onMount } from 'svelte';
    export let totalCheckout = 0;
    export let chartItems = [];
    let paymentForm, userHash, cardBrand, installments, selectedInstallment, cvv, expirationMonth, expirationYear, cardName, cardCPF;
    let SDKIsReady = false;
    let cardNumber = '';
    let componentIsReady = false;
    let paymentStatus = 'Aguardando pagamento';
    let paymentMethods = [];
    const pagSeguroHOST = 'https://stc.pagseguro.uol.com.br';

    onMount(() => componentIsReady = true);

    function SDKLoaded() {
        console.log('loaded')
        SDKIsReady = true;
    }

    function initializeSDK(sessionId) {
         // initialize our sdk
         PagSeguroDirectPayment.setSessionId(sessionId);

        PagSeguroDirectPayment.getPaymentMethods({
            amount: totalCheckout,
            success: function(response) {
                console.log(response);
                paymentMethods = Object.keys(response.paymentMethods).filter(p => p === 'CREDIT_CARD').map(paymentMethodKey => { 
                    const { name, code, options } = response.paymentMethods[paymentMethodKey];
                    const paymentMethod = {
                        name,
                        code,
                        options: Object.keys(options).map(option => options[option]),
                    }
                    return paymentMethod;
                });
            },
            error: function(response) {
                console.log('error', response);
            },
        });
    }

    $: if (SDKIsReady && componentIsReady) {
        fetch('/pagseguro/session')
            .then(response => response.json())
            .then(({data}) => {
                const parser = new DOMParser();
                const parsedXML = parser.parseFromString(data, 'application/xml')
                const sessionId = parsedXML.getElementsByTagName('id')[0].textContent;

                initializeSDK(sessionId);
            })
            .catch(e => console.error(e));
    }

    function handleCardnumberKeyup(e) {
        const cardNumberValue = e.target.value;
        if (!cardNumberValue) return;
        
        if (cardNumberValue.length > 16) {
            return cardNumber = cardNumber.slice(0, -1);
        }
        if (!cardBrand && cardNumberValue.length >= 6) {
            PagSeguroDirectPayment.getBrand({
                cardBin: cardNumberValue,
                success: function(response) {
                    console.log(response);
                    cardBrand = response.brand.name;
                },
                error: function(response) {
                    console.error(response);
                    cardBrand = null;
                },
            });
        }
        cardNumber = cardNumberValue
    }

    function handleCardnameBlur() {
        if (userHash) return false;
        console.log('getting userHash');
        PagSeguroDirectPayment.onSenderHashReady(function(response){
            console.log('user Hash response', response);
            if(response.status == 'error') {
                console.log(response.message);
                return false;
            }
            userHash = response.senderHash; //Hash estará disponível nesta variável.
        });
    };

    function handleCardnumberBlur() {
        if (cardBrand) {
            PagSeguroDirectPayment.getInstallments({
                    amount: totalCheckout,
                    maxInstallmentNoInterest: 2,
                    brand: cardBrand,
                    error: function(response) {
                        console.log(response);
                    },
                    complete: function(response){
                        console.log(response)
                        installments = response.installments[cardBrand];
                    }
            });
        }
    }

    function createCardToken() {
        return new Promise ((resolve, reject) => {
            if (!cardNumber) alert('preencha cardNumber')
            if (!cardBrand) alert('preencha cardBrand')
            if (!cvv) alert('preencha cvv')
            if (!expirationMonth) alert('preencha expirationMonth')
            if (!expirationYear) alert('preencha expirationYear')
            PagSeguroDirectPayment.createCardToken({
            brand: cardBrand,
            cardNumber,
            cvv,
            expirationMonth,
            expirationYear,
            success: response => resolve(response.card.token),
            error: response => reject(response),
            });
        }) 
    }

    async function handleSubmit() {
        try {
            const cardToken = await createCardToken();
    
            fetch('/pagseguro', {
                method: 'POST',
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'itemAmount1': totalCheckout,
                    'itemQuantity1': 1,
                    'itemId1': '0001',
                    'itemDescription1': 'Notebook Prata',
                    'creditCardToken': cardToken,
                    'installmentQuantity': selectedInstallment.quantity,
                    'installmentValue': selectedInstallment.installmentAmount,
                    'paymentMode': 'default',
                    'paymentMethod': 'creditCard',
                    'currency': 'BRL',
                    'extraAmount': '0.00',
                    'notificationURL': 'https://www.meuendereco.com.br/notificacao.html',
                    'reference': 'REF1234',
                    'senderName': 'Jose Comprador',
                    'senderCPF': '22111944785',
                    'senderAreaCode': '11',
                    'senderPhone': '56273440',
                    'senderEmail': 'comprador@sandbox.pagseguro.com.br',
                    'senderHash': userHash,
                    'shippingAddressStreet': 'Av. Brig. Faria Lima',
                    'shippingAddressNumber': '1384',
                    'shippingAddressComplement': '5o andar',
                    'shippingAddressDistrict': 'Jardim Paulistano',
                    'shippingAddressPostalCode': '01452002',
                    'shippingAddressCity': 'Sao Paulo',
                    'shippingAddressState': 'SP',
                    'shippingAddressCountry': 'BRA',
                    'shippingType': '1',
                    'shippingCost': '00.00',
                    'noInterestInstallmentQuantity': '12',
                    'creditCardHolderName': 'Jose Comprador',
                    'creditCardHolderCPF': '22111944785',
                    'creditCardHolderBirthDate': '27/10/1987',
                    'creditCardHolderAreaCode': '11',
                    'creditCardHolderPhone': '56273440',
                    'billingAddressStreet': 'Av. Brig. Faria Lima',
                    'billingAddressNumber': '1384',
                    'billingAddressComplement': '5o andar',
                    'billingAddressDistrict': 'Jardim Paulistano',
                    'billingAddressPostalCode': '01452002',
                    'billingAddressCity': 'Sao Paulo',
                    'billingAddressState': 'SP',
                    'billingAddressCountry': 'BRA',
                })
            })
                .then(response => response.json())
                .then(({data}) => {
                    console.log(data);
                    paymentStatus = data;
                })
                .catch(e => console.error(e));
        }catch(e) {
            alert(e);
        }
     }
        
</script>

<svelte:head>
        <script type="text/javascript" on:load={SDKLoaded} src="https://stc.sandbox.pagseguro.uol.com.br/pagseguro/api/v2/checkout/pagseguro.directpayment.js"></script>
</svelte:head>
<a href="https://dev.pagseguro.uol.com.br/reference/checkout-transparente" target="_blank">Documentação</a>
<a href="https://sandbox.pagseguro.uol.com.br/" target="_blank">Sandbox dashboard</a>
<a href="https://sandbox.pagseguro.uol.com.br/comprador-de-testes.html" target="_blank">valores de teste</a>
<div style="display: flex; align-items: center; flex-direction: column;">
    <div style="display: flex">
        <div style="max-width: 300px;">
            {#each paymentMethods as paymentMethod (paymentMethod.code)}
                <div>
                    <h4 style="font-size:12px">Bandeiras disponíveis</h4>
                    {#each paymentMethod.options as option}
                        {#if option && option.images}
                        <img src={`${pagSeguroHOST}/${option.images.MEDIUM.path}`} alt="payment"/>
                        {/if}
                        
                    {/each}
                </div>
            {/each}
        </div>
        
        <div>
            <form>
                <div style="display: flex">
                    <div>
                        <label for="cardNumber">Número do Cartão</label>
                        <input bind:value={cardNumber} name="cardNumber" type="text" placeholder="• • • •  • • • •  • • • •  • • • •" on:blur={handleCardnumberBlur} on:input="{e => handleCardnumberKeyup(e)}">
                    </div>
                    Bandeira: {cardBrand}
                </div>
                <div style="display: flex">
                    <label for="cardName">Nome</label>
                    <input bind:value={cardName} name="cardName" type="text" placeholder="Nome Completo" on:blur={handleCardnameBlur}>
                    <label for="cardCPF">CPF</label>
                    <input bind:value={cardCPF} name="cardCPF" type="text" placeholder="CPF">
                </div>

                <label for="cvv">cvv</label>
                <input bind:value={cvv} name="cvv" type="text" placeholder="CVV">

                <label for="expirationMonth">expirationMonth</label>
                <input bind:value={expirationMonth} name="expirationMonth" type="text" placeholder="Mês de expiração">

                <label for="expirationYear">expirationYear</label>
                <input bind:value={expirationYear} name="expirationYear" type="text" placeholder="Ano de expiração">

                {#if installments}
                    <label for="installment">Parcelas</label>
                    <select name="installments" bind:value={selectedInstallment}>
                        {#each installments as installment}
                            <option value={installment}>
                                {installment.quantity} - R${installment.installmentAmount}
                            </option>
                        {/each}
                    </select>
                {/if}
                <button type="submit" on:click|preventDefault={handleSubmit}>Pagar</button>
            </form>
        </div>
    </div>
  <pre>
    <code>
      {JSON.stringify(paymentStatus,null, 4)}
    </code>
  </pre>
      
</div>

<style>
 
</style>