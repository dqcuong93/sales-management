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

app.post('/', function (req, res) {
    db.dataFinding(req.body, function (data) {
        var _data = JSON.parse(data);
        res.render('home', {
            tableData: _data
        })
    });
});

app.get('/bill', function (req, res) {
    res.render('bill');
});

app.post('/bill', function (req, res) {
    db.createCustomer(req.body);
    db.createInvoice(req.body);
    res.redirect('/bill');
});

app.get('/cost', function (req, res) {
    res.render('cost');
});

app.post('/cost', function (req, res) {
    db.createCost(req.body);
    res.redirect('/cost')
});

app.post('/submit', function (req, res) {
    console.log(req.body);
});

var server = app.listen(8080, function () {
    console.log('Server has started on port ' + server.address().port);
    db.authenticateConnection();
    db.sync();
});