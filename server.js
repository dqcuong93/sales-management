var express = require('express');
var app = express();
var db = require('./db');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});

app.set('views', './views');
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(upload.array());

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/cost', function (req, res) {
    console.log('GET method called');
    res.render('cost');
});

app.post('/cost', function (req, res) {
   console.log('POST method called');
   res.redirect('/cost')
});

app.post('/', function (req, res) {
    console.log(req.body);
    db.createCustomer(req.body);
    db.createInvoice(req.body);
    res.redirect('/');
});

var server = app.listen(8080, function () {
    console.log('Server has started on port ' + server.address().port);
    db.authenticateConnection();
    db.sync();
});