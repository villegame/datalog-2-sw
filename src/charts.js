var LineChart = function (options) {

	var graphData = [];
	var traceOrders = [];
	var traceCount = 0;

	var gd;

	window.socket.on('sensor-data', function (data) {
       		traceOrders.forEach(function(trace) {
                        if(trace.id == data.id && data.hasOwnProperty(options.property)) {
                       	        var time = data.time;
               	                var startTime = time - (30*60*1000);
       	                        var minuteView = {
                                        xaxis : {
                                       	        type: 'date',
                               	                range: [startTime, time]
                       	                }
               	                };

       	                        if (!this.gd) return;
	
               	                Plotly.relayout(this.gd, minuteView);
       	                        Plotly.extendTraces(gd, {
                                        x: [[data.time]],
                               	        y: [[data[options.property]]]
                       	        }, [trace.order]);
               	        }
       	        });
        });

	$.get('/values', function (data) {
		try {
			var initData = JSON.parse(data);
		} catch (e) {
			console.log("ERROR FETCHING INITIAL DATA ", e);
		}

		initData.forEach(function(item) {
				
			if(item.hasOwnProperty(options.property)) {

				graphData.push({
					x : item.time,
					y : item[options.property],
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

		var layout = {
			title: options.property, 
			xaxis: {
				title: 'Time',
				type: 'date',
				showgrid: true,
				zeroline: false
			},
			yaxis: {
				title: options.property, 
				showgrid: true, 
				zeroline: true,
				showline: true,
			},
			showlegend: true
		};
		
		var d3 = Plotly.d3;
		var gd3 = d3.select('#' + options.placement)
			.append('div')
			.style({
				width: '100%',
				height: 450,
			});
		gd = gd3.node();

		Plotly.plot(gd, graphData, layout);  
		window.onresize = function () {
			Plotly.Plots.resize(gd);
		};

	});
};

module.exports.LineChart = LineChart;
