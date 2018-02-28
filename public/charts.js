var socket = io();

var LineChart = function () {

	var graphData = [];
	var traceOrders = [];
	var traceCount = 0;

	var placement = '';	
	var property = '';

	this.init = function (options) {

		property = options.property;
		placement = options.placement;

		$.get('/values', function (data) {
			try {
				console.log("INIT DATA", data);
				var initData = JSON.parse(data);
				initData.forEach(function(item) {
					
					if(item.hasOwnProperty(property)) {

						graphData.push({
							x : item.time,
							y : item[property],
							mode: 'lines',
							name: item.name,
							line: {color: item.color}
						});

						traceOrders.push({
							id : item.id,
							order : traceCount
						});

						traceCount++;
					}
				});
			
			} catch (e) {
				console.log("ERROR FETCHING INITIAL DATA ", e);
			}
		});
		var layout = {
			title: property, 
			xaxis: {
				title: 'Time',
				showgrid: true,
				zeroline: false
			},
			yaxis: {
				title: property, 
				showgrid: true, 
				zeroline: true,
				showline: true,
			}
		};
		Plotly.plot(placement, graphData, layout);  
	};

	socket.on('sensor-data', function (data) {
		console.log("Got data: ", data);

		traceOrders.forEach(function(trace) {
			if(trace.id == data.id && data.hasOwnProperty(property)) {
				var time = data.time;
				var startTime = time - (30*60*1000);
				var minuteView = {
					xaxis : {
						type: 'date',
						range: [startTime, time]
					}
				};			
				Plotly.relayout(placement, minuteView);
				Plotly.extendTraces(placement, {
					x: [[data.time]], 
					y: [[data[property]]]
				}, [trace.order]);
			}
		});
	});

};

