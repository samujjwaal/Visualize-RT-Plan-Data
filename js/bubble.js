d3.csv("data/bubble_chart.csv", function(patients) {
    var data = []
    var count = 0;
    var x = [];
    var y = [];
    var size = [];
    //var id = [];
    //console.log(patients)
    
    // for(count = 0; count<patients.length; count++){
    //     x[count] = patients[count].x;
    //     y[count] = patients[count].y;
    //     size[count] = patients[count].size;
    //     data.push({
    //         x: patients[count].x,
    //         y:  patients[count].y,
    //         size:  patients[count].size,
    //         gender: patients[count].gender,
    //         race: patients[count].race,
    //         hpv: patients[count].hpv,
    //         overall_survival: patients[count].overall_survival,
    //         t_category: patients[count].t_category,
    //         tumor_subsite: patients[count].tumor_subsite
    //     })

    // }
    
    var group_name = ['gender', 'race', 'hpv','overall_survival', 't_category', 'tumor_subsite'];
    
    //creating a dropdown patientList
    var div = document.querySelector("#bubble_dropdown"),
    fragment = document.createDocumentFragment(),
    create_select = document.createElement("select");
    create_select.setAttribute("id", "bubble_select");
    create_select.setAttribute("name", "Select Groups")
    //creating counter for all the loops
    var count;
    for (count = 0 ; count < group_name.length ; count ++){
        //var optionElementReference = new Option(text, value, defaultSelected, selected);
        if(count === 0){
            create_select.options.add( new Option(group_name[count], group_name[count]) );
        }else{
            create_select.options.add( new Option(group_name[count], group_name[count]) );
        }
    }
    fragment.appendChild(create_select);
    div.appendChild(fragment);

    
    //bubbleplot(0, patients);
    //by default show group of gender
    var onChange = false;
    if (onChange === false){
        //color(0, patients);
        bubbleplot(0, patients);

    }

    var selectedIndex = 0;
    document.getElementById("bubble_select").onchange = function(){
        onChange = true
        //alert(this.selectedIndex);
        selectedIndex = this.selectedIndex;
        console.log(selectedIndex);
        bubbleplot(selectedIndex, patients);
    };




});

function bubbleplot(id, data){
    d3.select('#bubble').select('svg').remove();
    var height = 300;
    var width = 500;
    var margin = 20;

    var labelX = 'X';
    var labelY = 'Y';
    var svg = d3.select('#bubble')
                .append('svg')
                .attr('class', 'chart')
                .attr("width", width + margin + margin)
                .attr("height", height + margin + margin)
                .append("g")
                .attr("transform", "translate(" + margin + "," + margin + ")");

    var x = d3.scale.linear()
            .domain([-38, 30])
            .range([0, width]);
    

    var y = d3.scale.linear()
            .domain([-19, 25])
            .range([height, 0]);

    var scale = d3.scale.sqrt()
                .domain([0, 97])
                .range([1, 20]);

    var opacity = d3.scale.sqrt()
                .domain([0, 97])
                .range([1, .5]);
    var xAxis = d3.svg.axis().scale(x);
    var yAxis = d3.svg.axis().scale(y).orient("left");
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 20)
            .attr("y", -margin)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(labelY);
    // x axis and label
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
            .attr("x", width + 20)
            .attr("y", margin - 10)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(labelX);

   if(id == 0 ){//gender
        var color0 = d3.scale.ordinal()
            .range(['#D81B60',
                '#1E88E5']);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .insert("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color0(d.gender); })
            .on('mouseover', function (d, i) {
                fade0(d.gender, .1);
            })
            .on('mouseout', function (d, i) {
                fadeOut();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");
    function fade0(c, opacity) {
        svg.selectAll("circle")
            .filter(function (d) {
                return d.gender != c;
            })
        .transition()
        .style("opacity", opacity);
    }

    }else if(id == 1){//race
        var color1 = d3.scale.ordinal()
            .range(['#D81B60',
                '#1E88E5',
                '#FFC107',
                '#004D40',
                '#870F62']);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .insert("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color1(d.race); })
            .on('mouseover', function (d, i) {
                fade1(d.race, .1);
            })
            .on('mouseout', function (d, i) {
                fadeOut();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");
    function fade1(c, opacity) {
        svg.selectAll("circle")
            .filter(function (d) {
                return d.race != c;
            })
        .transition()
        .style("opacity", opacity);
    }

    }else if(id == 2){//hpv
        var color2 = d3.scale.ordinal()
            .range(['#D81B60',
            
            '#1E88E5',
            
            '#004D40']);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .insert("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color2(d.hpv); })
            .on('mouseover', function (d, i) {
                fade2(d.hpv, .1);
            })
            .on('mouseout', function (d, i) {
                fadeOut();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");
    function fade2(c, opacity) {
        svg.selectAll("circle")
            .filter(function (d) {
                return d.hpv != c;
            })
        .transition()
        .style("opacity", opacity);
    }

    }else if(id == 3){//overall_survival
        var color3 = d3.scale.ordinal()
            .range(['#D81B60',
            '#1E88E5']);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .insert("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color3(d.overall_survival); })
            .on('mouseover', function (d, i) {
                fade3(d.overall_survival, .1);
            })
            .on('mouseout', function (d, i) {
                fadeOut();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");
    function fade3(c, opacity) {
    svg.selectAll("circle")
            .filter(function (d) {
                return d.overall_survival != c;
            })
        .transition()
        .style("opacity", opacity);
    }

    }else if(id == 4){//t_category
        var color4 = d3.scale.ordinal()
            .range(['#D81B60',
            '#1E88E5',
            '#004D40',
            '#870F62']);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .insert("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color4(d.t_category); })
            .on('mouseover', function (d, i) {
                fade4(d.t_category, .1);
            })
            .on('mouseout', function (d, i) {
                fadeOut();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");
    function fade4(c, opacity) {
        svg.selectAll("circle")
            .filter(function (d) {
                return d.t_category != c;
            })
        .transition()
        .style("opacity", opacity);
    }

    }else{//tumor_subsite
        var color5 = d3.scale.ordinal()
            .range(['#D81B60',
            '#1E88E5',
            '#FFC107',
            '#004D40',
            '#870F62']);
        svg.selectAll("circle")
            .data(data)
            .enter()
            .insert("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color5(d.tumor_subsite); })
            .on('mouseover', function (d, i) {
                fade5(d.tumor_subsite, .1);
            })
            .on('mouseout', function (d, i) {
                fadeOut();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");
    function fade5(c, opacity) {
        svg.selectAll("circle")
            .filter(function (d) {
                return d.tumor_subsite != c;
            })
        .transition()
        .style("opacity", opacity);
        }

    }

function fadeOut() {
svg.selectAll("circle")
.transition()
.style("opacity", function (d) { opacity(d.size); });
}
}
// function color(id, data){
//     var color0 = d3.scale.ordinal()
//             .range(['#ca0020',
//                 '#0571b0']);
//         d3.select('#bubble').select('svg').selectAll("circle")
//             .data(data)
//             .enter()
//             .attr("fill", function (d) { return color0(d.gender); })
//             .on('mouseover', function (d, i) {
//                 fade0(d.gender, .1);
//             })
//             .on('mouseout', function (d, i) {
//                 fadeOut();
//             })
//     function fade0(c, opacity) {
//         d3.select('#bubble').select('svg').selectAll("circle")
//             .filter(function (d) {
//                 return d.gender != c;
//             })
//         .transition()
//         .style("opacity", opacity);
//     }

//     function fadeOut() {
//         d3.select('#bubble').select('svg').selectAll("circle")
//         .transition()
//         .style("opacity", function (d) { opacity(d.size); });
//         }
// }