var socket = io();

socket.on('connected', function () {
	console.log("Connected!");
});

var LineChart = function (options) {

    var started = false;

    // parameters
    var windowX = options.sizeX;
    var windowY = options.sizeY;
    var missedTicks = [];

    var baseYMin = 0;
    var baseYMax = 30;
    var yAxisSpacing = 1;

    var limit = 60 * 1,
        duration = 750,
        now = new Date(Date.now() - duration)

    var width = windowX * options.ratioX;
    var height = windowY * options.ratioY;

    var colors = ['red', 'black', 'orange', 'grey', 'green'];

    var groups = {}; 

    var x = d3.time.scale()
        .domain([now - (limit - 2), now - duration])
        .range([0, width])

    var y = d3.scale.linear()
        .domain([baseYMin, baseYMax])
        .range([height, 0])

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d, i) {
            return x(now - (limit - 1 - i) * duration)
        })
        .y(function(d) {
            return y(d)
        })

    var svg = d3.select(options.placement).append('svg')
        .attr('class', 'chart')
        .attr('width', width)
        .attr('height', height + 50)

    var xAxis = svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x.axis = d3.svg.axis().scale(x).orient('bottom'))

    var yAxis = svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + width + ',0)')
        .call(y.axis = d3.svg.axis().scale(y).orient('left'))

    var paths = svg.append('g')

    function tick () {
        now = new Date()

        // Add new values
        for (var name in groups) {
            var group = groups[name]
            group.data.push(group.value)
            group.path.attr('d', line)
        }

        // Shift domains
        var minVals = []; //[baseYMin];
        var maxVals = []; //[baseYMax];
        for (var name in groups) {
	    var group = groups[name];
            if(group.hasOwnProperty('data')) {
                minVals.push(d3.min(group.data));
                maxVals.push(d3.max(group.data));
            }
        }

        x.domain([now - (limit - 2) * duration, now - duration])
	y.domain([d3.min(minVals)-yAxisSpacing, d3.max(maxVals)+yAxisSpacing])
	yAxis.call(y.axis = d3.svg.axis().scale(y).orient('left'));

        // Slide x-axis left
        xAxis.transition()
            .duration(duration)
            .ease('linear')
            .call(x.axis)

        // Slide paths left
        paths.attr('transform', null)
            .transition()
            .duration(duration)
            .ease('linear')
            .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
            .each('end', tick)

        // Remove oldest data point from each group
        for (var name in groups) {
            var group = groups[name]
            group.data.shift()
        }
    }


    tick();

    socket.on('sensor-data', function (data) {

	if(groups.hasOwnProperty(data.sensor) && data[options.property]) {
            groups[data.sensor].value = data[options.property];
	} else if (data[options.property]){

	    var count = 0;
	    for(var prop in groups) count++;

	    var group = groups[data.sensor] = {
		value : data[options.property],
		color : colors[count],
		data: d3.range(limit).map(function() {
		    return data[options.property];
		})
	    };
	    group.path = paths.append('path')
		.data([group.data])
		.attr('class', data.sensor + ' group')
		.style('stroke', group.color)
	    
	}
    });
}

