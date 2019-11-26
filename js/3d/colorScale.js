var ColorScale = (function(){
	
	var numSegments = 20;
	var svgs = [];
	var drawScale = function(target, colorMap, domain){
		var div = document.getElementById(target);
		var height = div.clientHeight;
		var width = div.clientWidth;
		var top = 20;
		var binHeight = (height - top)/numSegments;
		var doseInterval = (domain[1] - domain[0])/numSegments;
		var colors = [];
		var currentDose = domain[0];
		for(var i = 0; i < numSegments; i++){
			var newColor = colorMap(currentDose);
			currentDose = currentDose + doseInterval;
			colors.push(newColor);
		}
		var svg = d3.select('#'+target).append('svg')
			.attr('height', height + 10)
			.attr('width', 1.5*width);
		svg.selectAll('rect')
			.data(colors).enter()
			.append('rect')
			.attr('x', width/2)
			.attr('y', function(d,i){ return top + i*binHeight;})
			.attr('fill', function(d){ return d; })
			.attr('width', width/2)
			.attr('height', binHeight)
			.attr('opacity', .4);
		var strokeWidth = 2;
		var tickPositions = [top, height];
		svg.selectAll('line')
			.data(tickPositions).enter()
			.append('line')
			.attr('x1', width/2)
			.attr('x2', 0)
			.attr('y1', function(d){return d - strokeWidth/2;})
			.attr('y2', function(d){return d - strokeWidth/2;})
			.attr('stroke-width', 2)
			.attr('stroke', 'black');
		svg.selectAll('text')
			.data(tickPositions).enter()
			.append('text')
			.attr('font-size', 10)
			.attr('text-anchor', 'left')
			.attr('x', 0)
			.attr('y', function(d){return d - 5;})
			.text(function(x,i){ return Math.round(domain[i]) + ' Gy';});
		svgs.push(svg);
	}
	
	var setOpacity = function(opacity){
		svgs.forEach(function(svg){
			svg.selectAll('rect').attr('opacity', .4 + (opacity - .4)/2);
		});
	}
	
	var draw = function(){
		drawScale('doseColorScale', Controller.getDoseColor, data.getMeanDoseExtents());
		//drawScale('doseErrorColorScale', Controller.getDoseErrorColor, data.getDoseErrorExtents());
	}
	
	return {
		draw: draw,
		setOpacity: setOpacity
	}
})();