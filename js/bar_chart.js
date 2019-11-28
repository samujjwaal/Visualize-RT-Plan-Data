d3.json("Data/patient_dataset.json", function(patients) {
    //getting all patients IDs
    var patientIDs = getPatientIDS(patients);
    var dose = getPatientDoses(patients);
    //singleBoxPlot(dose);
    // box_plot(dose, patientIDs);
    // console.log(dose);
    // console.log(d3.min(dose));
    // console.log(d3.max(dose));
    //console.log(patientIDs);
    //creating a dropdown patientList
    var div = document.querySelector("#dropDown"),
    fragment = document.createDocumentFragment(),
    create_select = document.createElement("select");
    create_select.setAttribute("id", "select");
    create_select.setAttribute("name", "Select Patients")
    //creating counter for all the loops
    var count;
    for (count = 0 ; count < patientIDs.length ; count ++){
        //var optionElementReference = new Option(text, value, defaultSelected, selected);
        if(count === 0){
            create_select.options.add( new Option("Patient ID : " + patientIDs[count], patientIDs[count]) );
        }else{
            create_select.options.add( new Option("Patient ID : " + patientIDs[count], patientIDs[count]) );
        }
    }
    fragment.appendChild(create_select);
    div.appendChild(fragment);

    //by default show patient ID 3's information
    var onChange = false;
    if (onChange === false){
        var organList = getOrganList(0, patients);
        //console.log(organList);
        //mean dose of the organs
        var organMeanDose = getOrganMeanDose(0, organList, patients);

        bar_chart(organList, organMeanDose);

        //organ_threeD(0, patients, organList)
        //console.log(patients[2].organData.Brainstem);
    }

    //getting the selected patient index from the drop down
    var selectedIndex = 0;
    document.getElementById("select").onchange = function(){
        onChange = true
        //alert(this.selectedIndex);
        selectedIndex = this.selectedIndex;
        console.log(selectedIndex);
        var selectedPatientId = patientIDs[selectedIndex];
        console.log(selectedPatientId);

        //console.log(patients.keys(patients[0].organData));
        organList = getOrganList(selectedIndex, patients);
        //console.log(organList);
        //mean dose of the organs
        organMeanDose = getOrganMeanDose(selectedIndex, organList, patients);
        bar_chart(organList, organMeanDose);

    };
});

    //creating the bar chart
function bar_chart(orgList, meanDose){
    d3.select('#bar_chart').select('svg').remove();
    var margin = {top: 20, right: 20, bottom: 120, left: 20, spacing: 4},
    width = 1000 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    var svg = d3.select("#bar_chart").append("svg")
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

    //var barwidth = width / meanDose.length;

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "10px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-60)" );

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
        });

}

    //function for getting the organ list into an array
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
    for (count = 0 ; count < patients.length ; count ++){
        id[count] = patients[count].ID;
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

// function tooltipHover(patientID, volume) {
//     var tooltipString = "Patient: " + groupName;
//     tooltipString += "<br\>Max: " + formatAsFloat(metrics.max, 0.1);
//     tooltipString += "<br\>Q3: " + formatAsFloat(metrics.quartile3);
//     tooltipString += "<br\>Median: " + formatAsFloat(metrics.median);
//     tooltipString += "<br\>Q1: " + formatAsFloat(metrics.quartile1);
//     tooltipString += "<br\>Min: " + formatAsFloat(metrics.min);
//     return function () {
//         chart.objs.tooltip.transition().duration(200).style("opacity", 0.9);
//         chart.objs.tooltip.html(tooltipString)
//     };


