var margin = {
    top: 32,
    right: 20,
    bottom: 20,
    left:30
  };
  //top - 32 , right - 50 , bottom - 20 , left - 100
  var width = 100 - margin.left;
  var height = 200 - 32 - 20;
  var labelMargin = 8;

  var patientID = 10;
  var similarPatients = [];
  var count = 1;

  var scale = d3.scale.linear()
    .domain([0, 4])
    .range([0, 5])



  d3.json("data/patient_dataset.json", function(patients) {
  	console.log('count1');
      for(var patientcount = 0; patientcount<patients.length; patientcount++)
    {
      if (patients[patientcount].ID === patientID)
        {
         console.log(patients[patientcount].similar_patients); 
          similarPatients[0] = patientID;
          for(var j=0; j<patients[patientcount].similar_patients.length; j++)
          {
            similarPatients[count] = patients[patientcount].similar_patients[j];
            //console.log('similar patient ' + count + ' is ' + similarPatients[count]);
            count++;
          }
        }
    }
    console.log('similar patient is ' + similarPatients);
   
  });


  d3.csv('data/Preprocess/modified_patient_info_mdacc.csv')
    .row(function(d) {
    	console.log('count2');
      console.log(similarPatients.length);
      //if(d.dummy_id== similarPatients[2])
       {
        d.age_at_diagnosis = +d.age_at_diagnosis;
        d.total_dose = +d.total_dose;
        d.treatment_duration = +d.treatment_duration;
        d.t_category = +d.t_category*20;
        d.overall_survival = +d.overall_survival*80;
        return d;
       }
    })

    .get(function(error, rows) {
      var star = d3.starPlot()
        .width(width)
        .properties([
          'age_at_diagnosis',
          'total_dose',
          'treatment_duration',
          't_category',
          'overall_survival'
        ])
        .scales(scale)
        .labels([
          'Age',
          'Total dose',
          'Treatment duration',
          'T_category',
          'Overall survival'
        ])
        .title(function(d) { return "Patient ID: " + d.dummy_id; })
        .margin(margin)
        .labelMargin(labelMargin)

      rows.forEach(function(d, i) {
        //star.includeLabels(i % 4 === 0 ? true : false);

        var star_wrapper = d3.select('#target').append('div')
          .attr('class', 'star_wrapper')

        var svg = star_wrapper.append('svg')
          .attr('class', 'star_chart')
          .attr('width', width + margin.left + 10 )
          .attr('height', width + margin.top )

        var starG = svg.append('g')
          .datum(d)
          .call(star)
          .call(star.interaction)

        var interactionLabel = star_wrapper.append('div')
          .attr('class', 'interaction label')

        var circle = svg.append('circle')
          .attr('class', 'interaction circle')
          .attr('r', 5)

        var interaction = star_wrapper.selectAll('.interaction')
          .style('display', 'none');

        svg.selectAll('.star-interaction')
          .on('mouseover', function(d) {
            svg.selectAll('.star-label')
              .style('display', 'none');


            interaction
              .style('display', 'block');

            circle
              .attr('cx', d.x)
              .attr('cy', d.y);

            $interactionLabel = $(interactionLabel.node());
            interactionLabel
              .text( function() { if (d.key==='overall_survival') {
                return d.key + ': ' + d.datum[d.key]/80;
              }
              else if (d.key==='t_category') {
              return d.key + ': ' + d.datum[d.key]/20;
            }
              else  return d.key + ': ' + d.datum[d.key]}
              )
              .style('left', d.x + 'px')
              .style('top', d.y + 'px')
          })
          .on('mouseout', function(d) {
            interaction
              .style('display', 'none')

            svg.selectAll('.star-label')
              .style('display', 'block')
          })
      });
    });