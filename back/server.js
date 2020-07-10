const express = require('express')
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

const squareRoute = require('./routes/square')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, '..', 'front', 'public')))
//GET home route
app.get('/', (req, res) => {
    res.send('index.html')
});

app.use('/square', squareRoute)

app.listen(3000, () => console.log('Listening on port 3000'));