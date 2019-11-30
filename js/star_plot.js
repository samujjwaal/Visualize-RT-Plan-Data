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
  var count = 0;

  var scale = d3.scale.linear()
    .domain([0, 4])
    .range([0, 5])


  d3.json("data/patient_dataset.json", function(patients) {
      for(var patientcount = 0; patientcount<patients.length; patientcount++)
      {
        if (patients[patientcount].ID === patientID)
          {
            similarPatients.push(patients[patientcount].similar_patients);
            count++;
            //console.log(similarPatients);
          }
      }

  });


  d3.csv('data/test1.csv')
    .row(function(d) {
      //console.log(similarPatients);
      //if(d.dummy_id== 10183)
       //{
        d.age_at_diagnosis = +d.age_at_diagnosis;
        d.smoking_status_packs = +d.smoking_status_packs;
        d.total_dose = +d.total_dose;
        d.treatment_duration = +d.treatment_duration;
        d.overall_survival = +d.overall_survival*80;
        return d;
       //}
    })

    .get(function(error, rows) {
      var star = d3.starPlot()
        .width(width)
        .properties([
          'age_at_diagnosis',
          'smoking_status_packs',
          'total_dose',
          'treatment_duration',
          'overall_survival'
        ])
        .scales(scale)
        .labels([
          'Age',
          'Smoking status (Packs/Year)',
          'Total dose',
          'Treatment duration',
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