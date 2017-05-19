var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('You have requested home page !');
});

var server = app.listen(8080, function () {
    console.log('Server has started on port ' + server.address().port);
});