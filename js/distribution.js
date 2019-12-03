var distribution = (function(){
    function distribution_graph(){
        var self = this;
    }
    distribution_graph.init = function(){
        var chart1;
        d3.csv('data/distribution.csv', function(error, data) {
            data.forEach(function (d) {d.value = +d.value;});

            chart1 = makeDistroChart({
                data:data,
                xName:'name',
                yName:'value',
                axisLabels: {xAxis: null, yAxis: 'Values'},
                selector:"#chart-distro1",
                chartSize:{height:460, width:960},
                constrainExtremes:true});
            chart1.renderBoxPlot();
            chart1.renderDataPlots();
            chart1.renderNotchBoxes({showNotchBox:false});
            chart1.renderViolinPlot({showViolinPlot:false});

        });

    }

    return distribution_graph;

}());
                        
