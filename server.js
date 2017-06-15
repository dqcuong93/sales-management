var express = require('express');
var app = express();
var db = require('./db');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});

//Configuration
app.set('views', './views');
app.set('view engine', 'pug');

//Default use
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(upload.array());

//Home page
app.get('/', function (req, res) {
    res.render('home', {
        title: 'Home page',
        slogan: 'Have a nice day'
    });
});
app.post('/', function (req, res) {
    db.customerFinder(req.body, function (data) {
        res.render('home', {
            title: 'Home page',
            slogan: 'All your customer here, have a nice day',
            tableData: data
        });
    });
});

//Bill page
app.get('/bill', function (req, res) {
    res.render('bill', {
        title: 'Bill',
        slogan: 'Every day is a happy day, works as hard as you can'
    });
});
app.post('/bill', function (req, res) {
    db.createInvoice(req.body);
    res.redirect('/bill');
});

//Material page
app.get('/materialcost', function (req, res) {
    res.render('materialcost', {
        title: 'Material Costing',
        slogan: 'Ingredient cost, this place control your money flow'
    });
});
app.post('/materialcost', function (req, res) {
    db.createMaterial(req.body);
    res.redirect('/materialcost')
});

//Date report page
app.get('/datereport', function (req, res) {
    res.render('datereport', {
        title: 'Report by date',
        slogan: 'Report by date'
    });
});
app.post('/datereport', function (req, res) {
    db.reportByDate(req.body, function (invoice) {
        db.listAllProducts(function (listOfProducts) {
            res.render('datereport', {
                title: 'Report by date',
                slogan: 'Report by date',
                tableData: invoice,
                allProduct: listOfProducts
            });
        });
    });
});
app.put('/datereport', function (req, res) {
    console.log(req.body);
    db.invoiceUpdate(req.body, function () {
        res.status(200).end()
    });
});

//Capital report page
app.get('/capitalreport', function (req, res) {
    db.materialList(function (list) {
        res.render('capitalreport', {
            title: 'Capital report',
            slogan: 'Choosing the best ingredients making the customer happier',
            tableData: list
        });
    });
});

//Invoice report
app.get('/invoicereport', function (req, res) {
    db.listAllInvoiceHaventTakenMoney(function (invoices) {
        res.render('invoicereport', {
            title: 'Invoice report',
            slogan: 'This is the list of invoice haven\'t taken money',
            tableData: invoices
        });
    })
});

//Not official yet
app.post('/submit', function (req, res) {
    var requestBody = JSON.parse(JSON.stringify(req.body));
    console.log(requestBody);
});


//Start server
var server = app.listen(1993, function () {
    console.log('Server has started on port ' + server.address().port);
    db.authenticateConnection();
    db.sync();
});