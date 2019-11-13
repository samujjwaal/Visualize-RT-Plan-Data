d3.json("data/patient_dataset.json").then(function(patients) {
    //getting all patients IDs
    var patientIDs = getPatientIDS(patients);
    var dose = getPatientDoses(patients);
    singleBoxPlot(dose);
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
       // organ_threeD(0, patients, organList)
        console.log(patients[2].organData.Brainstem);
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
    var margin = {top: 80, right: 180, bottom: 80, left: 180},
    width = 1010 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

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
        .style("font-size", "8px")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)" );
    
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    
                    
    svg.selectAll("rectangle")
        .data(meanDose)
        .enter()
        .append("rect")
        .attr("class","rectangle")
        .attr("width", width/meanDose.length)
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


//trying to create the 3D view of the organs
function organ_threeD(id, data, organs){
    var width = d3.select('#c').node().clientWidth;
    var height = width * 0.85;
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0xA3A3A3);

    var camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0,2,20);
    camera.lookAt(0,0,0);

    var light = new THREE.DirectionalLight(0xffffff, 1.5);
    light.position.set(0,2,20);
    light.lookAt(0,0,0);

    camera.add(light);
    scene.add(camera);

    var renderer = new THREE.WebGLRenderer();

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update()

    renderer.setSize(width, height)
    document.getElementById('c').appendChild(renderer.domElement);

    update(renderer, scene, camera);

    var geometry = new THREE.Geometry();
    var material = new THREE.PointsMaterial({
        color: 'rgb(255,255,255)',
        size: 5,
        side: THREE.DoubleSide,
        sizeAttenuation: false,
        vertexColors: THREE.vertexColors
    });
    var count;
    for (count = 0 ; count < data.length ; count++){
        if (id === data[count].ID){
            var countAgain
            for(countAgain = 0; countAgain < organs.length; countAgain++){
                var xAxis = data[count].organs[countAgain].x;
                var yAxis = data[count].organs[countAgain].y;
                var zAxis = data[count].organs[countAgain].z;
                var volume = data[count].organs[countAgain].volume;
                var vector = new THREE.Vector3(xAxis, yAxis, zAxis);
                geometry.vertices.push(vector);

            }
        }

    }
    var organSystem = new THREE.Points(geometry, material);
    scene.add(organSystem);
}

function update(renderer, scene, camera){
    renderer.render(scene, camera);
    
    requestAnimationFrame(function(){
        update(renderer, scene, camera);
    });
    //controls.update();
}


function box_plot(dose, realID){
    // Size and color settings for the chart
    var labels = true; // show the text labels beside individual boxplots?

    var margin = {top: 30, right: 50, bottom: 70, left: 50};
    var  width = 800 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;
        
    var min = Infinity,
        max = -Infinity;
        
    // parse in the data	
    //d3.csv("data.csv", function(error, csv) {
        // using an array of arrays with
        // data[n][2] 
        // where n = number of columns in the csv file 
        // data[i][0] = name of the ith column
        // data[i][1] = array of values of ith column
    
        var data = [];
        data[0] = [];
        data[1] = [];
        data[2] = [];
        data[3] = [];
        // add more rows if your csv file has more columns
    
        // add here the header of the csv file
        data[0][0] = "Q1";
        data[1][0] = "Q2";
        data[2][0] = "Q3";
        data[3][0] = "Q4";
        // add more rows if your csv file has more columns
    
        data[0][1] = [];
        data[1][1] = [];
        data[2][1] = [];
        data[3][1] = [];

        var count;
        console.log(dose);
        var minDose = d3.min(dose);
        var maxDose = d3.max(dose);
        var difference = (maxDose - minDose) / 4 ;
        for (count = 0 ; count < dose.length ; count ++){
            if(dose[count] >= minDose && dose[count] < minDose + difference ){
                data[0][1].push(dose[count]);
            } else if (dose[count] >= minDose + difference && dose[count] < minDose + 2 * difference){
                data[1][1].push(dose[count]);
            }else if (dose[count] >= minDose + 2 * difference && dose[count] < minDose + 3 * difference){
                data[2][1].push(dose[count]);
            }else{
                data[3][1].push(dose[count]);
            }
        }
       // console.log(data);
      
        // //csv.forEach(function(x) {
        //     var v1 = Math.floor(x.Q1),
        //         v2 = Math.floor(x.Q2),
        //         v3 = Math.floor(x.Q3),
        //         v4 = Math.floor(x.Q4);
        //         // add more variables if your csv file has more columns
                
        //     var rowMax = Math.max(v1, Math.max(v2, Math.max(v3,v4)));
        //     var rowMin = Math.min(v1, Math.min(v2, Math.min(v3,v4)));
    
        //     data[0][1].push(v1);
        //     data[1][1].push(v2);
        //     data[2][1].push(v3);
        //     data[3][1].push(v4);
        //      // add more rows if your csv file has more columns
             
        //     if (rowMax > max) max = rowMax;
        //     if (rowMin < min) min = rowMin;	
        // //});
      
        var chart = d3.box()
            .whiskers(iqr(1.5))
            .height(height)	
            .domain([min, max])
            .showLabels(labels);
    
        var svg = d3.select("#box").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "box")    
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        // the x-axis
        var x = d3.scale.ordinal()	   
            .domain( data.map(function(d) { console.log(d); return d[0] } ) )	    
            .rangeRoundBands([0 , width], 0.7, 0.3); 		
    
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
    
        // the y-axis
        var y = d3.scale.linear()
            .domain([min, max])
            .range([height + margin.top, 0 + margin.top]);
        
        var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");
    
        // draw the boxplots	
        svg.selectAll(".box")	   
          .data(data)
          .enter().append("g")
            .attr("transform", function(d) { return "translate(" +  x(d[0])  + "," + margin.top + ")"; } )
          .call(chart.width(x.rangeBand())); 
        
              
        // add a title
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 + (margin.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "18px") 
            //.style("text-decoration", "underline")  
            .text("Revenue 2012");
     
         // draw y axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text") // and text1
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", ".71em")
              .style("text-anchor", "end")
              .style("font-size", "16px") 
              .text("Revenue in €");		
        
        // draw x axis	
        svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + (height  + margin.top + 10) + ")")
          .call(xAxis)
          .append("text")             // text label for the x axis
            .attr("x", (width / 2) )
            .attr("y",  10 )
            .attr("dy", ".71em")
            .style("text-anchor", "middle")
            .style("font-size", "16px") 
            .text("Quarter"); 
    //});
    
    // Returns a function to compute the interquartile range.
    function iqr(k) {
      return function(d, i) {
        var q1 = d.quartiles[0],
            q3 = d.quartiles[2],
            iqr = (q3 - q1) * k,
            i = -1,
            j = d.length;
        while (d[++i] < q1 - iqr);
        while (d[--j] > q3 + iqr);
        return [i, j];
      };
    }
}

function singleBoxPlot(dose){
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
  width = 400 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#box")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//console.log(data);
var data = []
var count ;
for(count = 0; count < dose.length; count++){
    data[count] = dose[count];
}

// Compute summary statistics used for the box:
//data.sort(function(a,b) { return +a.value - +b.value })
var data_sorted = data.sort(d3.ascending)
//var data_sorted = data.sort(function(a,b) { return +a.value - +b.value });
console.log(data_sorted);
var q1 = d3.quantile(data_sorted, .25)
var median = d3.quantile(data_sorted, .5)
var q3 = d3.quantile(data_sorted, .75)
var interQuantileRange = q3 - q1
var min = q1 - 1.5 * interQuantileRange
var max = q1 + 1.5 * interQuantileRange

// Show the Y scale
var y = d3.scale.linear()
  .domain([d3.min(dose),d3.max(dose)])
  .range([height, 0]);

var yAxis = d3.svg.axis()
.scale(y)
.orient("left");

svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

// a few features for the box
var center = 200
var width = 100

// Show the main vertical line
svg
.append("line")
  .attr("x1", center)
  .attr("x2", center)
  .attr("y1", y(min) )
  .attr("y2", y(max) )
  .attr("stroke", "black")

// Show the box
svg
.append("rect")
  .attr("x", center - width/2)
  .attr("y", y(q3) )
  .attr("height", (y(q1)-y(q3)) )
  .attr("width", width )
  .attr("stroke", "black")
  .style("fill", "#69b3a2")

// show median, min and max horizontal lines
svg
.selectAll("toto")
.data([min, median, max])
.enter()
.append("line")
  .attr("x1", center-width/2)
  .attr("x2", center+width/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "black")
}

