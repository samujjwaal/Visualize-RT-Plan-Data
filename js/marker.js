var marker = d3.select('#leftContent')
    .select('#chart_holder')
    .select('chart-wrapper')
    .select('inner-wrapper')
    .select('outer-box')
    .select('innner-box')
    .select('svg')
    .append('svg')
    .attr({'width' : 900, 'height': 600});

var symbol = d3.svg.symbol().type('triangle-up')
                .size(function(d){return scale(d); });

var data = ['Tumor', 'Age', 'Dose', 'Treatment', 'Smoke'];

var scale = d3.scale.linear()
                .domain([1, 5])
                .range([100, 1000]);

var colorscale = d3.scale.linear()
                    .domain([1,5])
                    .range(['red','steelblue']);

var group = marker.append('g')
            .attr('transform','translate('+ 200 +','+ 200 +')');

var line = group.selectAll('path')
                .data(data)
                .enter()
                .append('path')
                .attr('d',symbol)
				.attr('fill',function(d){ return colorscale(d); })
				.attr('stroke','#000')
				.attr('stroke-width',1)
				.attr('transform',function(d,i){ return "translate("+(i*38)+","+(10)+")"; });
