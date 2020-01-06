var bar = (function(){
    function bar_graph(){
        var self = this;
    }
    bar_graph.init = function(){

    }
    bar_graph.dropdown = function(id){
        //creating a dropdown patientList
        var div = document.querySelector("#dropDown"),
        fragment = document.createDocumentFragment(),
        create_select = document.createElement("select");
        create_select.setAttribute("id", "select");
        create_select.setAttribute("name", "Select Patients")
        //creating counter for all the loops
        var count;
        for (count = 0 ; count < id.length ; count++){
            // console.log(count)
            if(id[count] == 99992){
                create_select.options.add( new Option("UIC ID : " + id[count], id[count]) );
            }else{
                create_select.options.add( new Option("MDACC ID : " + id[count], id[count]) );
            }
        }
        fragment.appendChild(create_select);
        div.appendChild(fragment);
    }
    return bar_graph;

}());

    //creating the bar chart
function bar_chart(orgList, meanDose){
    d3.select('#bar_chart').select('svg').remove();
    var margin = {top: 5, right: 10, bottom: 90, left: 30, spacing: 1},
    width = document.getElementById("bar_holder").offsetWidth - margin.right - margin.left,
    height = document.getElementById("bar_holder").offsetHeight - margin.bottom - margin.top - margin.right;
    // console.log(document.getElementById("bar_holder").offsetWidth)

    var svg = d3.select("#bar_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scale.linear()
            .domain([d3.min(meanDose), d3.max(meanDose)])
            .range([height, 0]);

    var x = d3.scale.ordinal()
            .domain(orgList.map(function(d){ return d;}))
            .rangeBands([0, width]);

    var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

    var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");

    var tooltip = d3.select("#bar_chart").append("div")
                .attr("class", "tooltip_bar")
                .style('opacity', 0.9)

function mouseOver(d,i){
    tooltip.transition().duration(200)
        .style('opacity', .9)
    tooltip.html('<strong>Organ Name : ' + orgList[i] + 
                 '<br>Dose Volume : '+ d  + '</strong>')
            .style('left', (d3.select(this).attr("x")) + 'px')
            .style('top', (d3.select(this).attr("y")) + 'px');
  }

  function mouseOut(d) {
    tooltip.transition().duration(200).style("opacity", 0);
  }
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "9px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-45)" );

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);



    svg.selectAll("rectangle")
        .data(meanDose)
        .enter()
        .append("rect")
        .attr("class","rectangle")
        .attr("width", width/meanDose.length-margin.spacing)
        .attr("height", function(d){
            return height - y(d);
        })
        .attr("x", function(d, i){
            return (width / meanDose.length * i );
        })
        .attr("y", function(d){
            return y(d);
        })
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut)
        .style("cursor", "pointer");

}


function getOrganList(id, patients){
    var patient = patients[id].organData;
    var organs = Object.keys(patient);
    //removing GTVs
    var remove = function(name){
        var index = organs.indexOf(name);
        if(index > -1){
            organs.splice(index, 1);
        }
    }
    var gtvRegex = RegExp('GTV*');
    organs = organs.filter(o => !gtvRegex.test(o));
    return organs;
}

    //function for getting the mean doses of the organs into an array
function getOrganMeanDose(id, organsForMean, patients){
    var meanDose = []
    for (var count = 0; count < organsForMean.length ; count ++){
        var tempOrgan = organsForMean[count];
        meanDose[count] = patients[id].organData[tempOrgan].meanDose;
    }
    return meanDose;
}

function getPatientIDS(patients){
    var id = [];
    var count ;
    var index = 0;
    for (count = patients.length - 1 ; count >= 0 ; count--){
        id[index] = patients[count].ID;
        index++;
    }
    return id;
}

function getPatientDoses(patients) {
    var dose = [];
    var count ;
    for (count = 0; count < patients.length ; count ++){
        dose[count] = patients[count].total_Dose;
    }
    return dose;
}