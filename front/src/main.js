import App from './App.svelte';
import products from './mock/products.js';

const app = new App({
	target: document.body,
	props: {
		products,
	}
});

export default app;