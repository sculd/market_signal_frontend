const port = 3000;

var express = require('express'),
  app = express(),
  http = require('http'),
  httpServer = http.Server(app);

app.use(express.static(__dirname + '/assets'));
app.use('/assets', express.static('assets'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/alert', function(req, res) {
  res.sendFile(__dirname + '/alert.html');
});

app.get('/subscription', function(req, res) {
  res.sendFile(__dirname + '/subscription.html');
});

app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/about.html');
});

app.get('/navbar.html', function(req, res) {
  res.sendFile(__dirname + '/navbar.html');
});

app.listen(port);
