const mercadopago = require('mercadopago')
const express = require('express');
const Router = express.Router()
const { tokenSandbox } = require('../config').mercadopago;

Router.post('/', (req, res) => {
    const payment_data = req.body;
    
    mercadopago.configurations.setAccessToken(tokenSandbox);
    mercadopago.payment.save(payment_data).then(function (data) {
      console.log(data);
      res.send(data);
    }).catch(function (error) {
      console.log(error);
    });
})

module.exports = Router;