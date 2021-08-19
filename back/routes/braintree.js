const braintree = require("braintree");
const router = require('express').Router();
const { merchantId, publicKey, privateKey } = require('../config.js').braintree;

const gateway = new braintree.BraintreeGateway({ environment: braintree.Environment.Sandbox, merchantId, publicKey, privateKey, });

router.get("/client_token", (req, res) => {
	gateway.clientToken.generate({}).then(response => {
		res.send(response.clientToken);
	});
});


module.exports = router;