const mercadopago = require('mercadopago')
const express = require('express');
const Router = express.Router()

const tokenSandbox = 'TEST-2201614368810128-031516-4439e915b02a469f7061b3d6def4afb1-183465157';

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