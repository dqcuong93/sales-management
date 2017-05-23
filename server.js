var express = require('express');
var app = express();
var db = require('./db');

app.set('views', './views');
app.set('view engine', 'pug');

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('home');
});

var server = app.listen(8080, function () {
    console.log('Server has started on port ' + server.address().port);
    db.authenticateConnection();
    db.sync();
});