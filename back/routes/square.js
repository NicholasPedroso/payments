const Router = require('express').Router();

const squareConnect = require('square-connect');
const crypto = require('crypto');
const { accessToken } = require('../config.js').square;

// Set Square Connect credentials and environment
const defaultClient = squareConnect.ApiClient.instance;

// Configure OAuth2 access token for authorization: oauth2
const oauth2 = defaultClient.authentications['oauth2'];
oauth2.accessToken = accessToken;

// Set 'basePath' to switch between sandbox env and production env
// sandbox: https://connect.squareupsandbox.com
// production: https://connect.squareup.com
defaultClient.basePath = 'https://connect.squareupsandbox.com';

Router.post('/', async(req, res) => {
    const request_params = req.body;

    // length of idempotency_key should be less than 45
    const idempotency_key = crypto.randomBytes(22).toString('hex');

    // Charge the customer's card
    const payments_api = new squareConnect.PaymentsApi();
    const request_body = {
        source_id: request_params.nonce,
        amount_money: {
            amount: parseInt(request_params.amount_money.amount.replace('.', '')),
            currency: request_params.amount_money.currency,
        },
        idempotency_key: idempotency_key
    };

    try {
        const response = await payments_api.createPayment(request_body);
        res.status(200).json({
        'title': 'Payment Successful',
        'result': response
        });
    } catch(error) {
        res.status(500).json({
        'title': 'Payment Failure',
        'result': error.response.text
        });
    }
})

module.exports = Router;