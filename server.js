var express = require('express');
var app = express()

var server = app.listen(8080, function () {
    console.log('Server has started on port ' + server.address().port);
});