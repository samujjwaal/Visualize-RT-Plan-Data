d3.json("data/patient_dataset.json", function(patients) {
    var data = []
    var count = 0;
    var id = [];
    
    for(count = 0; count<patients.length; count++){
        id[count] = patients[count].ID;
        data[count] = {
            x: patients[count].organData['GTVp'].x,
            y:  patients[count].organData['GTVp'].y,
            size:  patients[count].organData['GTVp'].meanDose
        }

    }
    var merged_data = getCsvFileData(id, data);
    var group_name = ['gender', 'race', 'hpv','overall_survival', 'race', 't_category', 'tumor_subsite'];
    //var name = Object.keys(csv_file_data[0]);
    //var name = Object.getOwnPropertyNames(csv_file_data)
    //console.log(data['x']);
   // d3.select("#csv").append('p').html(merged_data);
    
    //creating a dropdown patientList
    var div = document.querySelector("#bubble_dropdown"),
    fragment = document.createDocumentFragment(),
    create_select = document.createElement("select");
    create_select.setAttribute("id", "select");
    create_select.setAttribute("name", "Select Patients")
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
    
    //by default show group of gender
    var onChange = false;
    if (onChange === false){
        bubbleplot(merged_data);

    }

});
function getCsvFileData(id, data){
    //console.log(id);
    var csv_data = []
    d3.csv("data/Preprocess/modified_patient_info_mdacc.csv", function(csv) {
        //console.log(id);
        var count = 0;
        var id_count = 0;
        for(id_count = 0; id_count < id.length ; id_count++){
            for (count = 0 ; count < csv.length ; count++){
                if(id[id_count] == csv[count].dummy_id){
                    csv_data.push({
                        id: csv[count].dummy_id,
                        x: data[id_count].x,
                        y: data[id_count].y,
                        size: data[id_count].size,
                        gender: csv[count].gender,
                        race: csv[count].race,
                        tumor_subsite: csv[count].tumor_subsite,
                        t_category: csv[count].t_category,
                        hpv: csv[count].hpv,
                        overall_survival: csv[count].overall_survival    
                    })
    
                }
                
            }

        }
        
        
        //console.log(data);
    });

    return csv_data;
}


function bubbleplot(merged_data){
    var height = 400;
    var width = 600;
    var margin = 40;

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
            .domain([d3.min(merged_data, function (d) { return d.x; }), d3.max(merged_data, function (d) { return d.x; })])
            .range([0, width]);
    console.log(d3.min(merged_data, function (d) { return d.x; }));

    var y = d3.scale.linear()
            .domain([d3.min(merged_data, function (d) { return d.y; }), d3.max(merged_data, function (d) { return d.y; })])
            .range([height, 0]);

    var scale = d3.scale.sqrt()
                .domain([d3.min(merged_data, function (d) { return d.size; }), d3.max(merged_data, function (d) { return d.size; })])
                .range([1, 20]);

    var opacity = d3.scale.sqrt()
                .domain([d3.min(merged_data, function (d) { return d.size; }), d3.max(merged_data, function (d) { return d.size; })])
                .range([1, .5]);
                                    
    var color = d3.scale.ordinal()
                    .range(['#b35806',
                        '#f1a340',
                        '#fee0b6',
                        '#d8daeb',
                        '#998ec3',
                        '#542788']);

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

    svg.selectAll("circle")
        .data(merged_data)
        .enter()
        .insert("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("opacity", function (d) { return opacity(d.size); })
        .attr("r", function (d) { return scale(d.size); })
        .style("fill", function (d) { return color(d.gender); })
        .on('mouseover', function (d, i) {
            fade(d.c, .1);
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
function fade(c, opacity) {
    svg.selectAll("circle")
        .filter(function (d) {
            return d.c != c;
        })
    .transition()
    .style("opacity", opacity);
}

function fadeOut() {
    svg.selectAll("circle")
    .transition()
    .style("opacity", function (d) { opacity(d.size); });
}
}