var fs = require('fs');
var http = require('http');
var express = require('express');

// DB(MySql) 연결
var client = require('mysql').createConnection({
	user: 'root',
	password: '',
	database: 'location'
});

// 웹 서버 생성.
var app = express();
var server = http.createServer(app);

// GET - /tracker
app.get('/tracker', function (req, res) {
	fs.readFile('Tracker.html', function(error, data) {
		res.send(data.toString());
	});
});

// GET - /observer
app.get('/observer', function(req, res) {
	fs.readFile('Observer.html', function(error, data) {
		res.send(data.toString());
	});
});

// GET - /showdata
app.get('/showdata', function(req, res) {
	client.query('SELECT * FROM locations WHERE name=?', [req.param('name')],
			function(error, data) {
		res.send(data);
	});
});

server.listen(52273, function() {
	console.log('Server Running at http://localhost:52273/');
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function(socket) {
	socket.on('join', function(data) {
		socket.join(data);
	});
	socket.on('location', function(data) {
		client.query('INSERT INTO locations(name, latitude, longitude, date) VALUES (?, ?, ?, NOW())', [data.name, data.latitude, data.longitude]);
		io.sockets.in(data.name).emit('receive', {
			latitude: data.latitude,
			longitude: data.longitude,
			date: Date.now()
		});
	});
});