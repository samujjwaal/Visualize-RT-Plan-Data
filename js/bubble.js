
// var medrtobj = medrtobj.init();
var bubble = (function(){
    function bubble_graph(){
        var self = this;
    }
    bubble_graph.init = function(){
        var file = "data/bubble_chart.csv"
    d3.csv(file, function(patients) {
        var data = []
        var count = 0;
        var x = [];
        var y = [];
        var size = [];


        var groups = ['gender', 'race', 'hpv','overall_survival', 't_category', 'tumor_subsite'];
        var group_name = ['Gender','Race','HPV','Overall Survival','T Category','Tumor Subsite'];

        //creating a dropdown patientList
        var div = document.querySelector("#bubble_dropdown"),
        fragment = document.createDocumentFragment(),
        create_select = document.createElement("select");
        create_select.setAttribute("id", "bubble_select");
        create_select.setAttribute("name", "Select Groups")
        //creating counter for all the loops
        var count;
        for (count = 0 ; count < groups.length ; count ++){
            //var optionElementReference = new Option(text, value, defaultSelected, selected);
            if(count === 0){
                create_select.options.add( new Option(group_name[count], groups[count]) );
            }else{
                create_select.options.add( new Option(group_name[count], groups[count]) );
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
            // console.log(selectedIndex);
            bubbleplot(selectedIndex, patients);
        };

    });

    }
    return bubble_graph;


})();


function bubbleplot(id, data){
    d3.select('#bubble').select('svg').remove();
    // var c = new medrtobj.medrt()
    var male_count = 0;
    var female_count = 0;
    var asian_count = 0;
    var hispanic_count = 0;
    var black_count = 0;
    var native_count = 0;
    var white_count = 0;
    var positive_count = 0;
    var negative_count = 0;
    var unknown_count = 0;
    var alive_count = 0;
    var dead_count = 0;
    var t1_count = 0;
    var t2_count = 0;
    var t3_count = 0;
    var t4_count = 0;
    var bot_count = 0;
    var gps_count = 0;
    var nos_count = 0;
    var tonsil_count = 0;
    var softPalate_count = 0;

    var count = 0
    //console.log(data[5].gender)
    for(count = 0 ; count < data.length ; count++){
        //counting gender
        if(data[count].gender == "Male"){
            male_count = male_count + 1 ;
        }else{
            female_count = female_count + 1;
        }

        //counting race
        if(data[count].race == "White"){
            white_count = white_count + 1 ;
        }else if (data[count].race == "Hispanic"){
            hispanic_count = hispanic_count + 1 ;
        }else if (data[count].race == "Black"){
            black_count = black_count + 1 ;
        }else if (data[count].race == "Native"){
            native_count = native_count + 1 ;
        }else if(data[count].race == "Asian"){
            asian_count = asian_count + 1;
        }

        //counting hpv
        if(data[count].hpv == "Positive"){
            positive_count = positive_count + 1 ;
        }else if (data[count].hpv == "Negative"){
            negative_count = negative_count + 1 ;
        }else{
            unknown_count = unknown_count + 1;
        }

        //counting overall_surviva;
        if(data[count].overall_survival == 0){
            dead_count = dead_count + 1 ;
        }else if (data[count].overall_survival == 1){
            alive_count = alive_count + 1 ;
        }

        //counting t_category
        if(data[count].t_category == "T1"){
            t1_count = t1_count + 1 ;
        }else if (data[count].t_category == "T2"){
            t2_count = t2_count + 1 ;
        }else if (data[count].t_category == "T3"){
            t3_count = t3_count + 1 ;
        }else{
            t4_count = t4_count + 1;
        }

        //counting tumor_subsite
        if(data[count].tumor_subsite == "Tonsil"){
            tonsil_count = tonsil_count + 1 ;
        }else if (data[count].tumor_subsite == "BOT"){
            bot_count = bot_count + 1 ;
        }else if (data[count].tumor_subsite == "NOS"){
            nos_count = nos_count + 1 ;
        }else if (data[count].tumor_subsite == "GPS"){
            gps_count = gps_count + 1 ;
        }else if (data[count].tumor_subsite == "Softpalate"){
            softPalate_count = softPalate_count + 1;
        }

    }

    var height = 250;
    var width = 400;
    var margin = 20;

    // var labelX = 'X';
    // var labelY = 'Y';
    var svg = d3.select('#bubble')
                .append('svg')
                .attr('class', 'chart')
                .attr("width", width + margin + margin)
                .attr("height", height + margin + margin)
                // .style("border", "black")
                // .style("border-style", "solid")
                .append("g")
                .attr("transform", "translate(" + margin + "," + margin + ")")
                .call(d3.behavior.zoom().on("zoom", function(){
                    svg.attr("transform", "translate(" + d3.event.translate +")" +  " scale(" + d3.event.scale + ")")
                }))
                .append("g");

    d3.select("#bubble").style("stroke", "black").style("stroke-width", .5);

    var tooltip = d3.select("#bubble").append('div')
                        .attr("class", "tooltip_bubble")
                        .style('opacity', 0.9);

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
            .attr("id", "circle")
            .attr("class", function(d){ return "bubbles " + d.gender })
            .attr("opacity", function (d) { return opacity(d.size); })
            // .attr("r", function(d){return d.size;})
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) {
                // console.log(d)
                return color0(d.gender); })
            .style("cursor", "pointer")
            .on('mouseover', function (d, i) {
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                tooltip.html('<strong> ID: ' + d.dummy_id + "<br>"
                    + "Gender: " + d.gender + "</strong>")
                        .style('left', (d3.select(this).attr("cx") + 20) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                fade0(d.gender, .1);
            })
            .on('mouseout', function (d, i) {
                tooltip.transition().duration(200).style("opacity", 0)
                fadeOut();
            })
            .on('click', function(d){                
                genderColorRevert();    
                d3.select(this).style("fill", "#ffffbf");            
                var id = Number(d.dummy_id);
                selectedPatient = id;
                var selctedPatientIndex = getIndex(selectedPatient);
                // console.log(json_patients);
                bar.init();
				var organList = getOrganList(selctedPatientIndex, json_patients);
				var organMeanDose = getOrganMeanDose(selctedPatientIndex, organList, json_patients);
				bar_chart(organList, organMeanDose);
                medrtobj.init();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");

    function genderColorRevert(){
        svg.selectAll("circle").style("fill", function(d){
            return color0(d.gender);
        });
        
    }

      var gender_size = 20;
      var gender_group = ["Male", "Female"];
      d3.select("#bubble").select("svg").append("svg").selectAll("myrect")
        .data(gender_group)
        .enter()
        .append("circle")
            .attr("cx", 350)
            .attr("cy", function(d,i){ return 10 + i*(gender_size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color0(d)})
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "Male"){
                    // console.log(male_count)
                    tooltip.html('<strong> Total ' + d + " : " + male_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else{
                    // console.log(female_count)
                    tooltip.html('<strong> Total ' + d + " : " + female_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })

    // Add labels beside legend dots
    d3.select("#bubble").select("svg").append("svg").selectAll("mylabels")
      .data(gender_group)
      .enter()
      .append("text")
        .attr("x", 350 + gender_size*.8)
        .attr("y", function(d,i){ return i * (gender_size + 5) + (gender_size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color0(d)})
        .style("cursor", "pointer")
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", function(d){
            tooltip.transition().duration(200)
                .style("opacity", .9)
            if(d == "Male"){
                console.log(male_count)
                tooltip.html('<strong> Total ' + d + " : " + male_count + "</strong>")
                    .style('left', (d3.select(this).attr("cx")) + 'px')
                    .style('top', (d3.select(this).attr("cy")) + 'px')
            }else{
                console.log(female_count)
                tooltip.html('<strong> Total ' + d + " : " + female_count + "</strong>")
                    .style('left', (d3.select(this).attr("cx")) + 'px')
                    .style('top', (d3.select(this).attr("cy")) + 'px')
            }
            highlight(d);
        })
        .on("mouseleave", function(d, i){
            tooltip.transition().duration(200).style("opacity", 0)
            noHighlight(d);
        })

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
            .attr("id", "circle")
            .attr("class", function(d){ return "bubbles " + d.race })
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color1(d.race); })
            .style("cursor", "pointer")
            .on('mouseover', function (d, i) {
                tooltip.transition().duration(200)
                .style("opacity", .9)
                tooltip.html('<strong> ID: ' + d.dummy_id + "<br>"
                    + "Race: " + d.race + "</strong>")
                        .style('left', (d3.select(this).attr("cx") + 20) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                fade1(d.race, .1);
            })
            .on('mouseout', function (d, i) {
                tooltip.transition().duration(200).style("opacity", 0)
                fadeOut();
            })
            .on('click', function(d){
                raceColorRevert();    
                d3.select(this).style("fill", "#ffffbf");
                var id = Number(d.dummy_id);
                selectedPatient = id;
                var selctedPatientIndex = getIndex(selectedPatient);
                bar.init();
				var organList = getOrganList(selctedPatientIndex, json_patients);
				var organMeanDose = getOrganMeanDose(selctedPatientIndex, organList, json_patients);
				bar_chart(organList, organMeanDose);
                medrtobj.init();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");

            
        function raceColorRevert(){
            svg.selectAll("circle").style("fill", function(d){
                return color1(d.race);
            });
            
        }
            
            
            var race_size = 80;
            var race_group = ["Asian", "Hispanic", "Black",
            "Native","White"];
            d3.select("#bubble").select("svg").append("svg").selectAll("myrect")
                .data(race_group)
                .enter()
                .append("circle")
                .attr("cx", function(d,i){ return 10 + i * (race_size + 5)})
                .attr("cy", 15) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("r", 7)
                .style("fill", function(d){ return color1(d)})
                .style("cursor", "pointer")
                .on("mouseover", function(d){
                    tooltip.transition().duration(200)
                        .style("opacity", .9)
                    if(d == "Asian"){
                        tooltip.html('<strong> Total ' + d + " : " + asian_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }else if(d == "Hispanic"){
                        tooltip.html('<strong> Total ' + d + " : " + hispanic_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }else if(d == "Black"){
                        tooltip.html('<strong> Total ' + d + " : " + black_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }else if(d == "Native"){
                        tooltip.html('<strong> Total ' + d + " : " + native_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }else if(d == "White"){
                        tooltip.html('<strong> Total ' + d + " : " + white_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }
                    highlight(d);
                })
                .on("mouseleave", function(d, i){
                    tooltip.transition().duration(200).style("opacity", 0)
                    noHighlight(d);
                })

              // Add labels beside legend dots
              d3.select("#bubble").select("svg").append("svg").selectAll("mylabels")
                    .data(race_group)
                    .enter()
                    .append("text")
                    .attr("x", function(d,i){ return i * (race_size + 5) + (race_size/4)})
                    .attr("y", 15 )// 100 is where the first dot appears. 25 is the distance between dots
                    .style("fill", function(d){ return color1(d)})
                    .text(function(d){ return d})
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle")
                    .style("cursor", "pointer")
                    .on("mouseover", function(d){
                        tooltip.transition().duration(200)
                            .style("opacity", .9)
                        if(d == "Asian"){
                            tooltip.html('<strong> Total ' + d + " : " + asian_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }else if(d == "Hispanic"){
                            tooltip.html('<strong> Total ' + d + " : " + hispanic_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }else if(d == "Black"){
                            tooltip.html('<strong> Total ' + d + " : " + black_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }else if(d == "Native"){
                            tooltip.html('<strong> Total ' + d + " : " + native_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }else if(d == "White"){
                            tooltip.html('<strong> Total ' + d + " : " + white_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }
                        highlight(d);
                    })
                    .on("mouseleave", function(d, i){
                        tooltip.transition().duration(200).style("opacity", 0)
                        noHighlight(d);
                    })



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
            .attr("id", "circle")
            .attr("class", function(d){ return "bubbles " + d.hpv })
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color2(d.hpv); })
            .style("cursor", "pointer")
            .on('mouseover', function (d, i) {
                tooltip.transition().duration(200)
                .style("opacity", .9)
                tooltip.html('<strong> ID: ' + d.dummy_id + "<br>"
                    + "HPV: " + d.hpv + "</strong>")
                        .style('left', (d3.select(this).attr("cx") + 20) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                fade2(d.hpv, .1);
            })
            .on('mouseout', function (d, i) {
                tooltip.transition().duration(200).style("opacity", 0)
                fadeOut();
            })
            .on('click', function(d){
                hpvColorRevert();    
                d3.select(this).style("fill", "#ffffbf");
                var id = Number(d.dummy_id);
                selectedPatient = id;
                var selctedPatientIndex = getIndex(selectedPatient);
                bar.init();
				var organList = getOrganList(selctedPatientIndex, json_patients);
				var organMeanDose = getOrganMeanDose(selctedPatientIndex, organList, json_patients);
				bar_chart(organList, organMeanDose);
                medrtobj.init();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");


        function hpvColorRevert(){
            svg.selectAll("circle").style("fill", function(d){
                return color2(d.hpv);
            });            
        }
            
        var hpv_size = 80;
        var hpv_group = ["Positive", "Negative", "Unknown"];
        d3.select("#bubble").select("svg").append("svg").selectAll("myrect")
            .data(hpv_group)
            .enter()
            .append("circle")
            .attr("cx", function(d,i){ return 10 + i * (hpv_size + 5)})
            .attr("cy", 15) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color2(d)})
            .style("cursor", "pointer")
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "Positive"){
                    tooltip.html('<strong> Total ' + d + " : " + positive_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Negative"){
                    tooltip.html('<strong> Total ' + d + " : " + negative_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Unknown"){
                    tooltip.html('<strong> Total ' + d + " : " + unknown_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })

            // Add labels beside legend dots
        d3.select("#bubble").select("svg").append("svg").selectAll("mylabels")
            .data(hpv_group)
            .enter()
            .append("text")
            .attr("x", function(d,i){ return i * (hpv_size + 5) + (hpv_size/4)})
            .attr("y", 15 )    // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color2(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("cursor", "pointer")
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "Positive"){
                    tooltip.html('<strong> Total ' + d + " : " + positive_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Negative"){
                    tooltip.html('<strong> Total ' + d + " : " + negative_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Unknown"){
                    tooltip.html('<strong> Total ' + d + " : " + unknown_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })

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
            .attr("id", "circle")
            .attr("class", function(d){ return "bubbles_survive" + d.overall_survival })
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color3(d.overall_survival); })
            .style("cursor", "pointer")
            .on('mouseover', function (d, i) {
                tooltip.transition().duration(200)
                .style("opacity", .9)
                tooltip.html('<strong> ID: ' + d.dummy_id + "<br>"
                    + "Survive: " + d.overall_survival + "</strong>")
                        .style('left', (d3.select(this).attr("cx") + 20) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                fade3(d.overall_survival, .1);
            })
            .on('mouseout', function (d, i) {
                tooltip.transition().duration(200).style("opacity", 0)
                fadeOut();
            })
            .on('click', function(d){
                OverallColorRevert();    
                d3.select(this).style("fill", "#ffffbf");
                var id = Number(d.dummy_id);
                selectedPatient = id;
                var selctedPatientIndex = getIndex(selectedPatient);
                bar.init();
				var organList = getOrganList(selctedPatientIndex, json_patients);
				var organMeanDose = getOrganMeanDose(selctedPatientIndex, organList, json_patients);
				bar_chart(organList, organMeanDose);
                medrtobj.init();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");

            
        function OverallColorRevert(){
            svg.selectAll("circle").style("fill", function(d){
                return color3(d.overall_survival);
            });            
        }
            var survival_size = 20;
            var survival_group = ["0", "1"];
            d3.select("#bubble").select("svg").append("svg").selectAll("myrect")
                .data(survival_group)
                .enter()
                .append("circle")
                    .attr("cx", 350)
                    .attr("cy", function(d,i){ return 10 + i*(survival_size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                    .attr("r", 7)
                    .style("fill", function(d){ return color3(d)})
                    .style("cursor", "pointer")
                    .on("mouseover", function(d){
                        tooltip.transition().duration(200)
                            .style("opacity", .9)
                        if(d == "0"){
                            tooltip.html('<strong> Total Dead' + " : " + dead_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }else if(d == "1"){
                            tooltip.html('<strong> Total Alive' + d + " : " + alive_count + "</strong>")
                                .style('left', (d3.select(this).attr("cx")) + 'px')
                                .style('top', (d3.select(this).attr("cy")) + 'px')
                        }
                        highlight_survive(d);
                    })
                    .on("mouseleave", function(d, i){
                        tooltip.transition().duration(200).style("opacity", 0)
                        noHighlight_survive(d);
                    })

            // Add labels beside legend dots
            d3.select("#bubble").select("svg").append("svg").selectAll("mylabels")
            .data(survival_group)
            .enter()
            .append("text")
                .attr("x", 350 + survival_size*.8)
                .attr("y", function(d,i){ return i * (survival_size + 5) + (survival_size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return color3(d)})
                .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("cursor", "pointer")
                .on("mouseover", function(d){
                    tooltip.transition().duration(200)
                        .style("opacity", .9)
                    if(d == "0"){
                        tooltip.html('<strong> Total Dead' + " : " + dead_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }else if(d == "1"){
                        tooltip.html('<strong> Total Alive' + d + " : " + alive_count + "</strong>")
                            .style('left', (d3.select(this).attr("cx")) + 'px')
                            .style('top', (d3.select(this).attr("cy")) + 'px')
                    }
                    highlight_survive(d);
                })
                .on("mouseleave", function(d, i){
                    tooltip.transition().duration(200).style("opacity", 0)
                    noHighlight_survive(d);
                })


    function fade3(c, opacity) {
    svg.selectAll("circle")
            .filter(function (d) {
                return d.overall_survival != c;
            })
        .transition()
        .style("opacity", opacity);
    }

    //     // What to do when one group is hovered
    function highlight_survive(d){
        // reduce opacity of all groups
        d3.select("#bubble").select("svg").selectAll("#circle").style("opacity", .05)
        // expect the one that is hovered
        d3.select("#bubble").select("svg").selectAll(".bubbles_survive"+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    function noHighlight_survive(d){
        d3.select("#bubble").select("svg").selectAll("#circle").style("opacity", 1)
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
            .attr("id", "circle")
            .attr("class", function(d){ return "bubbles " + d.t_category })
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color4(d.t_category); })
            .style("cursor", "pointer")
            .on('mouseover', function (d, i) {
                tooltip.transition().duration(200)
                .style("opacity", .9)
                tooltip.html('<strong> ID: ' + d.dummy_id + "<br>"
                    + "T_Cat: " + d.t_category + "</strong>")
                        .style('left', (d3.select(this).attr("cx") + 20) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                fade4(d.t_category, .1);
            })
            .on('mouseout', function (d, i) {
                tooltip.transition().duration(200).style("opacity", 0)
                fadeOut();
            })
            .on('click', function(d){
                tCategoryColorRevert();    
                d3.select(this).style("fill", "#ffffbf");
                var id = Number(d.dummy_id);
                selectedPatient = id;
                var selctedPatientIndex = getIndex(selectedPatient);
                bar.init();
				var organList = getOrganList(selctedPatientIndex, json_patients);
				var organMeanDose = getOrganMeanDose(selctedPatientIndex, organList, json_patients);
				bar_chart(organList, organMeanDose);
                medrtobj.init();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");

        function tCategoryColorRevert(){
            svg.selectAll("circle").style("fill", function(d){
                return color4(d.t_category);
            });            
        }
        
        var t_size = 80;
        var t_group = ["T1", "T2", "T3", "T4"];
        d3.select("#bubble").select("svg").append("svg").selectAll("myrect")
            .data(t_group)
            .enter()
            .append("circle")
            .attr("cx", function(d,i){ return 10 + i * (t_size + 5)})
            .attr("cy", 15)  // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d){ return color4(d)})
            .style("cursor", "pointer")
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "T1"){
                    tooltip.html('<strong> Total ' + d + " : " + t1_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "T2"){
                    tooltip.html('<strong> Total ' + d + " : " + t2_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "T3"){
                    tooltip.html('<strong> Total ' + d + " : " + t3_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "T4"){
                    tooltip.html('<strong> Total ' + d + " : " + t4_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })

        // Add labels beside legend dots
        d3.select("#bubble").select("svg").append("svg").selectAll("mylabels")
            .data(t_group)
            .enter()
            .append("text")
            .attr("x", function(d,i){ return i * (t_size + 5) + (t_size/4)})
            .attr("y", 15 )  // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return color4(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("cursor", "pointer")
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "T1"){
                    tooltip.html('<strong> Total ' + d + " : " + t1_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "T2"){
                    tooltip.html('<strong> Total ' + d + " : " + t2_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "T3"){
                    tooltip.html('<strong> Total ' + d + " : " + t3_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "T4"){
                    tooltip.html('<strong> Total ' + d + " : " + t4_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })

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
            .attr("id", "circle")
            .attr("class", function(d){ return "bubbles " + d.tumor_subsite })
            .attr("opacity", function (d) { return opacity(d.size); })
            .attr("r", function (d) { return scale(d.size); })
            .style("fill", function (d) { return color5(d.tumor_subsite); })
            .style("cursor", "pointer")
            .on('mouseover', function (d, i) {
                tooltip.transition().duration(200)
                .style("opacity", .9)
                tooltip.html('<strong> ID: ' + d.dummy_id + "<br>"
                    + "Tumor: " + d.tumor_subsite + "</strong>")
                        .style('left', (d3.select(this).attr("cx") + 20) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                fade5(d.tumor_subsite, .1);
            })
            .on('mouseout', function (d, i) {
                tooltip.transition().duration(200).style("opacity", 0)
                fadeOut();
            })
            .on('click', function(d){
                tumorColorRevert();    
                d3.select(this).style("fill", "#ffffbf");
                var id = Number(d.dummy_id);
                selectedPatient = id;
                var selctedPatientIndex = getIndex(selectedPatient);
                bar.init();
				var organList = getOrganList(selctedPatientIndex, json_patients);
				var organMeanDose = getOrganMeanDose(selctedPatientIndex, organList, json_patients);
				bar_chart(organList, organMeanDose);
                medrtobj.init();
            })
            .transition()
            .delay(function (d, i) { return x(d.x) - y(d.y); })
            .duration(500)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); })
                .ease("bounce");

    function tumorColorRevert(){
        svg.selectAll("circle").style("fill", function(d){
            return color5(d.tumor_subsite);
        });            
    }

        var tumor_size = 80;
        var tumor_group = ["BOT", "GPS", "NOS", "Tonsil", "Softpalate"];
        d3.select("#bubble").select("svg").append("svg").selectAll("myrect")
            .data(tumor_group)
            .enter()
            .append("circle")
            .attr("cx", function(d,i){ return 10 + i * (tumor_size + 5)})
            .attr("cy", 15)
            .attr("r", 7)
            .style("fill", function(d){ return color5(d)})
            .style("cursor", "pointer")
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "BOT"){
                    tooltip.html('<strong> Total ' + d + " : " + bot_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "GPS"){
                    tooltip.html('<strong> Total ' + d + " : " + gps_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "NOS"){
                    tooltip.html('<strong> Total ' + d + " : " + nos_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Tonsil"){
                    tooltip.html('<strong> Total ' + d + " : " + tonsil_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Softpalate"){
                    tooltip.html('<strong> Total ' + d + " : " + softPalate_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })

        // Add labels beside legend dots
        d3.select("#bubble").select("svg").append("svg").selectAll("mylabels")
            .data(tumor_group)
            .enter()
            .append("text")
            .attr("x", function(d,i){ return i * (tumor_size + 5) + (tumor_size/4)})
            .attr("y", 15 )
            .style("fill", function(d){ return color5(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .style("cursor", "pointer")
            .on("mouseover", function(d){
                tooltip.transition().duration(200)
                    .style("opacity", .9)
                if(d == "BOT"){
                    tooltip.html('<strong> Total ' + d + " : " + bot_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "GPS"){
                    tooltip.html('<strong> Total ' + d + " : " + gps_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "NOS"){
                    tooltip.html('<strong> Total ' + d + " : " + nos_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Tonsil"){
                    tooltip.html('<strong> Total ' + d + " : " + tonsil_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }else if(d == "Soft palate"){
                    tooltip.html('<strong> Total ' + d + " : " + softPalate_count + "</strong>")
                        .style('left', (d3.select(this).attr("cx")) + 'px')
                        .style('top', (d3.select(this).attr("cy")) + 'px')
                }
                highlight(d);
            })
            .on("mouseleave", function(d, i){
                tooltip.transition().duration(200).style("opacity", 0)
                noHighlight(d);
            })



    function fade5(c, opacity) {
        svg.selectAll("circle")
            .filter(function (d) {
                return d.tumor_subsite != c;
            })
        .transition()
        .style("opacity", opacity);
        }

    }

    //     // What to do when one group is hovered
    function highlight(d){
        // reduce opacity of all groups
        d3.select("#bubble").select("svg").selectAll("#circle").style("opacity", .05)
        // expect the one that is hovered
        d3.select("#bubble").select("svg").selectAll("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    function noHighlight(d){
        d3.select("#bubble").select("svg").selectAll("#circle").style("opacity", 1)
    }

function fadeOut() {
svg.selectAll("circle")
.transition()
.style("opacity", function (d) { opacity(d.size); });
}
}
function getIndex(patientID){
    var setIndex = 0;
    for (var count = 0 ; count < allPatientDropdownIds.length ; count ++){
        if(patientID == allPatientDropdownIds[count]){
            setIndex = count;
            break;
        }
    }
    return setIndex;
}