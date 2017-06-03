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

//Home page
app.get('/', function (req, res) {
    res.render('home', {
        slogan: 'Have a nice day'
    });
});

app.post('/', function (req, res) {
    db.dataFinding(req.body, function (data) {
        res.render('home', {
            tableData: data
        });
    });
});

//Bill page
app.get('/bill', function (req, res) {
    res.render('bill', {
        slogan: 'Every day is a happy day, works as hard as you can'
    });
});

app.post('/bill', function (req, res) {
    db.createInvoice(req.body);
    res.redirect('/bill');
});

//Costing page
app.get('/cost', function (req, res) {
    res.render('cost', {
        slogan: 'Ingredient cost, this place control your money flow'
    });
});

app.post('/cost', function (req, res) {
    db.createCost(req.body);
    res.redirect('/cost')
});

//Report page
app.get('/datereport', function (req, res) {
    res.render('dayreport', {
        slogan: 'Report by date'
    });
});

app.post('/datereport', function (req, res) {
    db.reportByDate(req.body, function (invoice) {
        res.render('dayreport', {
            slogan: 'Report by date',
            tableData: invoice
        });
    });
});

//Not official yet
app.post('/submit', function (req, res) {
    var requestBody = JSON.parse(JSON.stringify(req.body));
    console.log(requestBody);
});


//Start server
var server = app.listen(8080, function () {
    console.log('Server has started on port ' + server.address().port);
    db.authenticateConnection();
    db.sync();
});