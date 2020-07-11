const router = require('express').Router();

const stripe = require("stripe")("sk_test_51H3THOCW1XUwUGyA4f3pWGPM4SsrxVb0W5NUTWlPJvxG4csooeJ0MA0xuzsY5RCy4hWwvI61wuALWg6bOdWXUMsj00xB0Gx1RL");

function getAmount(items) { 
	 const amount = items.reduce((acc, curr) => acc + curr.price, 0);
	 return parseInt(amount.toString().replace('.', ''));
};

router.post("/", async (req, res) => {
	const { items } = req.body;
	// Create a PaymentIntent with the order amount and currency
	try {
		const paymentIntent = await stripe.paymentIntents.create({
			amount: getAmount(items),
			currency: "usd"
		});
		res.send({
			clientSecret: paymentIntent.client_secret
		});
	}catch(e) {
		console.log(e);
		return res.status(500).send(e)
	}
});

module.exports = router;