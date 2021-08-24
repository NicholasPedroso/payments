const https = require('https');
const fs = require('fs');
const cors = require('cors');
const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const stripeRoute = require('./routes/stripe')
const braintreeRoute = require('./routes/braintree')
// const squareRoute = require('./routes/square')
// const pagSeguroRoute = require('./routes/pagseguro')
// const mercadoPagoRoute = require('./routes/mercadopago')

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '..', 'front', 'public')))
//GET home route
app.get('/', (req, res) => {
    res.send('index.html')
});

app.use('/stripe', stripeRoute)
app.use('/braintree', braintreeRoute)
// app.use('/square', squareRoute)
// app.use('/pagseguro', pagSeguroRoute);
// app.use('/mercadopago', mercadoPagoRoute);

https.createServer({
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
    passphrase: 'nick'
}, app)
.listen(4433, () => console.log('Server is ready'));

// app.listen(4433, () => console.log('App is listening on 4433'))