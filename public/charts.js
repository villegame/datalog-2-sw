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
			},
			showlegend: true, 
			width: 1000
		};

		/*
		var d3 = Plotly.d3;
		var gd3 = d3.select(placement)
			.append('div')
			.attr('style', function (d) {
				return "{ width: 80%, 'margin-left': 10%}";
			});
		var gd = gd3.node();
		*/
		//Plotly.plot(gd, graphData, layout);  
		Plotly.plot(placement, graphData, layout);  
	};

	socket.on('sensor-data', function (data) {
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

