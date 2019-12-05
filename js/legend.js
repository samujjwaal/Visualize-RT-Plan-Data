var w = 300, h = 30;

    var key = d3.select("#legend3D")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    var legend = key.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "100%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#f7f7f7")
      .attr("stop-opacity", 1);

    // legend.append("stop")
    //   .attr("offset", "33%")
    //   .attr("stop-color", "#bae4bc")
    //   .attr("stop-opacity", 1);

    // legend.append("stop")
    //   .attr("offset", "66%")
    //   .attr("stop-color", "#7bccc4")
    //   .attr("stop-opacity", 1);

    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#252525")
      .attr("stop-opacity", 1);

    key.append("rect")
      .attr("width", w)
      .attr("height", h - 20)
      .style("fill", "url(#gradient)")
      .attr("transform", "translate(0,0)");

    var y = d3.scale.linear()
      .range([300, 0])
      .domain([86, 20]);

    
    var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(5)
      .orient("bottom");

    key.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0,10)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", "5px")
      .attr("dy", ".5em")
      .style("text-anchor", "end");