"use strict";

// PWM server for Raspberry Pi
var port = 80;
var fs = require('fs');
var http = require('http');
var url = require('url') ;
var util = require('util');
var exec = require('child_process').exec;
var page = '\
<!doctype html>\
<html>\
<head>\
<title>Raspberry Pi PWM Server</title>\
</head>\
<body style="margin-left:2em">\
<h1>PwmServer for Raspberry Pi</h1>\
<form>\
<table border="0" cellpadding="2">\
<tr><td>Red</td><td><input type="text" name="r" size="8"></td></tr>\
<tr><td>Green</td><td><input type="text" name="g" size="8"></td></tr>\
<tr><td>Blue</td><td><input type="text" name="b" size="8"></td></tr>\
<tr><td></td><td><input type="submit" value="Submit"></td></tr>\
</table>\
</form>\
</body>\
</html>';

http.createServer(handler).listen(port);
console.log("Started PwmServer for Raspberry Pi on port", port);

function handler(req, res) {
  var queryObject = url.parse(req.url,true).query;
  handleQuery(queryObject);
  res.writeHead(200);
  res.end(page);
}

function handleQuery(q){	
  if(Object.keys(q).length > 0) console.log("?:", q);
  if(q.hasOwnProperty('r')){ setColor('r', q.r); }
  if(q.hasOwnProperty('g')){ setColor('g', q.g); }
  if(q.hasOwnProperty('b')){ setColor('b', q.b); }
}

function setColor(color, rawValue) {
	var pin = colorToPin(color);
	if (null == pin) {
		console.log("Unexpected color:", color);
		return;
	}
	var value = parseInt(rawValue);
	// verify that it wasn't coerced to zero, etc
	if(value.toString() == rawValue) {
		if (value >= 0 && value <= 100) {
			// convert to 0.0 - 1.0:
			value /= 100.0;
			var str = 'echo "' + pin + "=" + value.toString() + '" > /dev/pi-blaster';
			executeCommand(str);
		}
	}
}

// color can be 'r', 'g', or 'b'
function colorToPin(color) {
	switch(color) {
		case 'r': return '18';
		case 'g': return '23';
		case 'b': return '24';
	}
	return null;
}

function executeCommand(cmd) {
	console.log("EXEC:", cmd);
	exec(cmd, function(error, stdout, stderr) {
		if(error) {
			console.log("ERROR:", error);
		}
	});
}
