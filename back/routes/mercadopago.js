// const path = require('path')

// const getPath = require('platform-folders');
// const localMercadopago = path.resolve(getPath.getDocumentsFolder(), 'ML-projetos', 'dx-nodejs', 'index.js')


// const mercadopago = require(localMercadopago);
const mercadopago = require('mercadopago');

const express = require('express');
const Router = express.Router()
const { tokenSandbox } = require('../config').mercadopago;

Router.post('/', (req, res) => {
  const payment_data = req.body;
  console.log(payment_data);
  payment_data.statement_descriptor = "Payment descriptor"
  
    mercadopago.configure({
      access_token: tokenSandbox,
      client_id: '392874298374',
      client_secret: '8472823'
  });

  mercadopago.payment.save(payment_data).then(function (data) {
    console.log('make payment success', data);
    return res.send(data)
  }).catch(function (error) {
    console.log('error make payment ', error);
    res.status(500).send(error)
  });
})

  

module.exports = Router;