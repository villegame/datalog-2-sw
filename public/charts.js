var socket = io();

socket.on('connected', function () {
	console.log("Connected!");
});

socket.on('sensor-data', function (data) {
	console.log("Got data: ", data);
});
