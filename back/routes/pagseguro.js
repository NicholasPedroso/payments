const express = require('express');
const Router = express.Router()
const axios = require('axios');
const { tokenSandbox, emailSandbox } = require('../config').pagseguro;

const PAGSEGURO_HOST = 'https://ws.sandbox.pagseguro.uol.com.br/v2'

Router.post('/', (req, res) => {
    const params = req.body;
    const QSParams = new URLSearchParams(params).toString();

    axios.post(`${PAGSEGURO_HOST}/transactions?token=${tokenSandbox}&email=${emailSandbox}`, QSParams, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => {
            res.json({data: response.data})
        })
        .catch(e => {
            res.status(500).json({error: e})
        });
})

Router.get('/session', (req, res) => {
    axios.post(`${PAGSEGURO_HOST}/sessions?token=${tokenSandbox}&email=${emailSandbox}`)
        .then(XMLResponse => res.json({data: XMLResponse.data}))
        .catch(e => res.status(500).json({error: e}))
});

module.exports = Router;