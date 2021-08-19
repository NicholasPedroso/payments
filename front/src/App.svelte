<script>
	import { onMount } from 'svelte';
	import Stripe from './components/Stripe/Stripe.svelte';
	// import Square from './components/Square/Square.svelte';
	// import PagSeguro from './components/PagSeguro/PagSeguro.svelte';
	// import MercadoPago from './components/MercadoPago/MercadoPago.svelte';
	// import MercadoPagoV2 from './components/MercadoPago/MercadoPagoV2.svelte';
	import { fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
import Braintree from './components/Braintree/Braintree.svelte';

	onMount(() => {
		const URL = new URLSearchParams(window.location.search);
		const checkout = URL.get('checkout');
		const items = URL.get('items');
		if (checkout) selectedIntegrationType = integrationType.filter(c => c.name === checkout)[0] || [];
		if (items) items.split(',').forEach(id => Number(id) ? addChart(Number(id)) : '');
		if (selectedIntegrationType && chartProducts) doingCheckout = true;
	})

	export let products;

	let integrationType = [
		{
			name: 'stripe',
			component: Stripe
		},
		{
			name: 'braintree',
			component: Braintree
		},
		// {
		// 	name: 'square',
		// 	component: Square
		// },
		// {
		// 	name: 'PagSeguro',
		// 	component: PagSeguro
		// },
		// {
		// 	name: 'MercadoPago',
		// 	component: MercadoPago
		// },
		// {
		// 	name: 'MercadoPagoV2',
		// 	component: MercadoPagoV2
		// },
	];
	let selectedIntegrationType;

	
	let chartProducts = [];
	
	let doingCheckout = false;

	$: qntProducts = chartProducts.length
	$: totalCheckout = chartProducts.reduce((acc, curr) => acc + curr.price, 0).toFixed(2);

	function addChart(id){
		const newProduct = products.filter(p => id === p.id)[0];
		chartProducts = [...chartProducts, newProduct];
		products = products.filter(p => p.id !== id);
	}
	function removeChart(id){
		const removedProduct = chartProducts.filter(p => id === p.id)[0];
		products = [...products, removedProduct];
		chartProducts = chartProducts.filter(p => p.id !== id);
	}
	function enterCheckout(){
		if (!selectedIntegrationType) return alert('Selecione uma integração');
		if (!chartProducts) return alert('Carrinho vazio')
		doingCheckout = true
		const { host } = window.location;
		const newSearchURL = new URLSearchParams();
		newSearchURL.append('checkout', selectedIntegrationType.name);
		newSearchURL.append('items', chartProducts.map(p => p.id));
		window.location.search = newSearchURL.toString();
	}
</script>

<header class="header">
	<div style="display: flex; align-items: center; position: relative;">
		<a href="/">
			<img src="/images/logo.png" alt="logo" style="width:140px"/>
			<h1 style="    position: absolute;
			left: 0px;
			right: 0px;
			text-align: center;
			top: 18px;
			color: rgb(255, 255, 255);
			font-size: 10.9px;">MercadoPago
			</h1>
		</a>
	</div>

	{#if doingCheckout}
		<img style="max-width: 140px; max-height: 60px;" src={`/images/${selectedIntegrationType.name}.png`} alt={selectedIntegrationType.name}/>
	{:else}
		<div>
			<div style="display: flex; justify-content: center;">
				{#each integrationType as integration (integration.name)}
					<label style="margin-right: 16px;">
						<input type=radio bind:group={selectedIntegrationType} value={integration}>
						{integration.name}
					</label>
				{/each}
			</div>
		</div>
	{/if}

	<div class="header-product-info">
		<span>Produtos: <span style="font-weight: bold">{qntProducts}</span></span>
		<span>Total: <span style="font-weight: bold">R${totalCheckout}</span></span>
	</div>
</header>
<main>
	{#if !doingCheckout}
		<div out:fade class="eCommerce-wrapper">
			<ul class="product-items-wrapper">
				<h2 style="color: #b86b11; margin-top: 0">Produtos:</h2>
				{#each products as {id, title, type, description, filename, height, width, price} (id)}
					<li animate:flip="{{duration: 1000}}" in:fade class="product-item">
						<p class="product-item__description">
							<span class="product-item__title">{title}</span> - {description}
						</p>
						<div class="product-item-menu">
							R${price.toFixed(2)} 
							<button class="product-item__btn" on:click={() => addChart(id)}>Adicionar</button>
						</div>
					</li>
				{:else}
					<div>Vazio</div>
				{/each}
				</ul>
			<ul class="product-chart-wrapper">
				<h2 style="color: #b86b11; margin-top: 0">Carrinho:</h2>
				{#each chartProducts as {id, title, type, description, filename, height, width, price} (id)}
					<li animate:flip="{{duration: 1000}}" in:fade class="product-item">
						<p class="product-item__description">
							<span class="product-item__title">{title}</span> - {description}
						</p>
						<div class="product-item-menu">
							R${price.toFixed(2)} 
							<button class="product-item__btn product-item__btn--remove" on:click={() => removeChart(id)}>Remover</button>
						</div>
					</li>
				{:else}
					<div>Vazio</div>
				{/each}
				{#if chartProducts.length}
				<button on:click="{enterCheckout}">Pagar</button>
				{/if}
			</ul>
		</div>
	{/if}
</main>

{#if doingCheckout && selectedIntegrationType}
	<svelte:component this={selectedIntegrationType.component} {totalCheckout} {chartProducts}/>
{/if}

<style>
	button {
    border-radius: 12px;
    outline: none;
    background-color: #18a9d8;
    border: 1px solid #1d8baf;
    color: #fff;
    cursor: pointer;
	}
	.header {
		display: flex;
		height: 60px;
		align-items: center;
		justify-content: space-between;
		padding: 24px;
		border-radius: 12px;
		box-sizing: border-box;
	}
	.header-product-info {
		display: flex;
		flex-direction: column;
	}
	.eCommerce-wrapper {
		display: flex;
		justify-content: space-between;
	}
	.product-item-menu {
		display: flex;
    	min-width: 160px;
    	justify-content: space-between;
    	align-items: center;
		font-style: italic;
	}
	.product-items-wrapper,
	.product-chart-wrapper {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		flex-basis: 0;
		flex-shrink: 1;
		padding: 24px;
		border: 2px dashed #3fb7da;
		border-radius: 14px;
		margin: 24px;
	}
	.product-item {
		margin-bottom: 16px;
    	display: flex;
    	border: 1px dashed #80cdea;
    	padding: 8px;
		border-radius: 4px;
		justify-content: space-between;
		color: #067b8e;
	}
	.product-item__title {
		font-weight: bold;
	}

	.product-item__description,
	.product-item__price {
		margin: 0;
    	display: flex;
    	align-items: center;
	}
	.product-item__btn {
		margin: 0;
	}
	.product-item__btn--remove {
		background-color: #ff7777;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 24px;
		font-weight: 600;
	}

	.integration-type__item {
		list-style: none;
		margin: 12px;
	}
</style>