var Data = function(patientData, oAtlas) {
	var pData = patientData;
	// console.log(pData[5]);
	var oAtlas = oAtlas;
	var public = {};
	var patientCount = pData.length;
	var clusterColors = ['#ffec78', '#464168', '#8dd3c7', '#e78ac3', 'blue', '#80b1d3', 'purple', 'green', 'goldenrod', 'steelblue', 'brown', 'silver', 'burlywood', 'greenyellow', 'darkslategray']
	let defaultClusterColor = '#0000000';
	var gtvRegex = RegExp('GTV*');
	var functions = {


		getMeanDoseExtents: function(){
			var max = 0;
			var min = 100;
			var organs = this.getOrganList();
			pData.forEach(function(p){
				organs.forEach(function(o){
					var organ = p.organData[o];
					var dose = organ.meanDose;
					max = (max > dose)? max:dose;
					min = (min < dose)? min:dose;
				});
			});
			return [min, max];
		},

		getDoseErrorExtents: function(){
			var max = 0;
			var min = 100;
			var organs = this.getOrganList();
			pData.forEach(function(p){
				organs.forEach(function(o){
					var organ = p.organData[o];
					var error  = Math.abs(organ.meanDose - organ.estimatedDose);
					max = (max > error)? max:error;
					min = (min < error)? min:error;
				});
			});
			return [min, max];
		},

		getTotalDose: function(id){
			var patient = this.getPatient(+id);
			return patient.total_Dose;
		},

		getSubsite: function(id){
			var patient = this.getPatient(+id);
			return patient.tumorSubsite;
		},

		getLaterality: function(id){
			var patient = this.getPatient(+id);
			return patient.laterality;
		},

		getTumorVolume: function(id){
			var patient = this.getPatient(+id);
			return patient.tumorVolume;
		},

		hasToxicity: function(id){
			var patient = this.getPatient(+id);
			return patient.toxicity
		},

		getClusterColor: function(id, patient = true){
			if(patient){
				var cluster = this.getCluster(id);
			} else{
				var cluster = id;
			}
			if( cluster-1 > clusterColors.length){
				return defaultClusterColor;
			}
			return clusterColors[cluster-1];
		},

		getInternalIdList: function(){
			var ids = new Array();
			pData.forEach(function(d){
				ids.push(d.ID_internal);
			});
			return(ids);
		},

		getPatientId: function(internalId){
			var patient = this.getPatient(internalId);
			return +patient.ID;
		},

		getInternalId: function(externalId){
			for(var i = 1; i <= patientCount + 1; i++){
				var id = this.getPatientId(i);
				if(+id == +externalId){
					return i;
				}
			}
			return -1;
		},

		getPatientName: function(internalId){
			var id = this.getPatientId(internalId);
			return "ID: " + id;
		},

		getPatient: function(patientInternalId){
			var id = patientInternalId;
			return (pData[id - 1] == undefined)? -1 : pData[id-1];
		},

		getPatientOrganData: function(id){
			var patient = this.getPatient(id);
			return patient.organData;
		},

		getOrganList: function(id = 1){
			var organs = this.getPatientOrganData(id);
			var organList = Object.keys(organs);
			// var remove = function(name){
			// 	var index = organList.indexOf(name);
			// 	if(index > -1){
			// 		organList.splice(index, 1);
			// 	}
			// }
			var gtvRegex = RegExp('GTV*');
			organList = organList.filter(o => !gtvRegex.test(o));
			return organList;
		},

		//I will assume it's always internal id now?
		getMeanDose: function(id, organ){
			var patient = this.getPatient(id);
			return patient.organData[organ].meanDose;
		},

		getMinDose: function(id, organ){
			var patient = this.getPatient(id);
			return patient.organData[organ].minDose;
		},

		getMaxDose: function(id, organ){
			var patient = this.getPatient(id);
			return patient.organData[organ].maxDose;
		},

		getOrganVolume: function(id, organ){
			var patient = this.getPatient(id);
			return patient.organData[organ].volume;
		},

		getEstimatedDose: function(id, organ){
			var patient = this.getPatient(id);
			return patient.organData[organ + ""].estimatedDose;
		},

		getEstimationError: function(id, organ){
			var patient = this.getPatient(id);
			var meanDose = patient.organData[organ + ""].meanDose;
			var estimatedDose = patient.organData[organ + ""].estimatedDose;
			return Math.abs(estimatedDose - meanDose);
		},

		getCluster: function(id){
			var patient = this.getPatient(id);
			return +patient.cluster;
		},

		getDistancePCA: function(id, component){
			//this is technically tsne embedding now but I'm afraid to change names
			var patient = this.getPatient(id);
			return patient.distance_pca[component - 1];
		},

		getDosePCA: function(id, component){
			var patient = this.getPatient(id);
			return patient.dose_pca[component - 1];
		},

		getSimilaritySpaceEmbedding: function(id, component){
			var patient = this.getPatient(id);
			return patient.similarity_embedding[component - 1];
		},

		gtvpVol: function(id){ return this.getPatient(id).gtvp_volume;},

		gtvnVol: function(id){ return this.getPatient(id).gtvn_volume;},

		getPatientMeanDose: function(id){
			var organData = this.getPatientOrganData(id);
			var totalDose = 0;
			var count = 0;
			Object.keys(organData).forEach(function(organ){
				totalDose += this.getMeanDose(id, organ);
				count += 1
			}, this);
			return totalDose/count;
		},

		getPatientMeanError: function(id){
			var patient = this.getPatient(id);
			return patient.mean_error*100;
		},

		getPatientMatches: function(id){
			var patient = this.getPatient(id);
			//double check that the patient is it's first match
			let matches = patient.similar_patients;
			// console.log(matches)
			let position = matches.indexOf(+id);
			if(position != 0){
				matches.splice(position, 1);
				matches.unshift(+id);
				let scores = patient.similarity_scores;
				scores.unshift( scores.splice(position, 1) );
			}
			return matches;
		},

		getPatientSimilarityScores: function(id){
			var patient = this.getPatient(id);
			return patient.similarity_scores;
		},

		getFormatedSimilarityScore: function(id, match_arg){
			var score = this.getPatient(id).similarity_scores[match_arg];
			score = score.toFixed(4);
			if(score < 0){
				score = "! " + Math.abs(score);
			}
			return (score + '').replace(/0+./, '.');
		},

		getSortedPatients: function(){
			var sortedData = pData.concat().sort(function(x,y){ return (+x.ID_internal) > (+y.ID_internal); });
			return sortedData;
		},

		getSimilarity: function(p1, p2){
			var index = this.getPatientMatches(+p1).indexOf(+p2);
			var similarity = this.getPatientSimilarityScores(+p1)[index];
			return similarity
		},

	};
	function getMin(pos) {

		var x = pos.reduce(function (min, obj) {
			return obj.x < min ? obj.x : min;
		}, Infinity);

		var y = pos.reduce(function (min, obj) {
			return obj.y < min ? obj.y : min;
		}, Infinity);

		var z = pos.reduce(function (min, obj) {
			return obj.z < min ? obj.z : min;
		}, Infinity);

		if (x == Infinity || y == Infinity || z == Infinity)
			return [0.0, 0.0, 0.0];

		return [x, y, z];
	}

	function getMax(pos) {

		var x = pos.reduce(function (max, obj) {
			return obj.x > max ? obj.x : max;
		}, -Infinity);

		var y = pos.reduce(function (max, obj) {
			return obj.y > max ? obj.y : max;
		}, -Infinity);

		var z = pos.reduce(function (max, obj) {
			return obj.z > max ? obj.z : max;
		}, -Infinity);

		if (x == -Infinity || y == -Infinity || z == -Infinity)
			return [0.0, 0.0, 0.0];

		return [x, y, z];
	}
	function flipGraph() {
		//coordinate rotation and scaling for organ positions
		var flip = function(point){
			let x = -1*point.x;
			let y = -1*point.y;
			let z = -1*point.z;

			point.x = 1.3*y;
			point.y = 2.5*z;
			point.z = 1.1*x;
			return point;
		};

		for (var i = 0; i < patientCount; i++) {
			var patientOrganList = functions.getPatientOrganData(i+1);
			for (var pOrgan in patientOrganList) {
				patientOrganList[pOrgan] = flip(patientOrganList[pOrgan]);
				// var tOrganX = (patientOrganList[pOrgan].x * -1);
				// var tOrganY = (patientOrganList[pOrgan].y * -1);
				// var tOrganZ = (patientOrganList[pOrgan].z * -1);

				// patientOrganList[pOrgan].x = tOrganY * 1.3;
				// patientOrganList[pOrgan].y = tOrganZ * 2.5;
				// patientOrganList[pOrgan].z = tOrganX * 1.1;
			}
		}
		for (var pOrgan in oAtlas) {
			oAtlas[pOrgan] = flip(oAtlas[pOrgan]);
			// var tOrganX = (oAtlas[pOrgan].x * -1);
			// var tOrganY = (oAtlas[pOrgan].y * -1);
			// var tOrganZ = (oAtlas[pOrgan].z * -1);

			// oAtlas[pOrgan].x = tOrganY * 1.3;
			// oAtlas[pOrgan].y = tOrganZ * 2.5;
			// oAtlas[pOrgan].z = tOrganX * 1.1;
		}
	}

	function computeCenterOfGraphAndShift() {
		//coordiante translation so that the organs are centered, I think
		for (var i = 0; i < patientCount; i++) {
			var sceneCenter = [0.0, 0.0, 0.0];
			var xyzMin = new Array(3);
			var xyzMax = new Array(3);
			var positions = [];
			var patientOrganList = functions.getPatientOrganData(i+1);
			for (var pOrgan in patientOrganList) {
				var xyz = {
					x: patientOrganList[pOrgan].x,
					y: patientOrganList[pOrgan].y,
					z: patientOrganList[pOrgan].z
				};
				positions.push(xyz);
			}
			xyzMin = getMin(positions);
			xyzMax = getMax(positions);

			sceneCenter = [
				((xyzMin[0] + xyzMax[0]) / 2),
				((xyzMin[1] + xyzMax[1]) / 2),
				((xyzMin[2] + xyzMax[2]) / 2)
			];
			for (var pOrgan in patientOrganList) {

				patientOrganList[pOrgan].x = (patientOrganList[pOrgan].x - sceneCenter[0]);
				patientOrganList[pOrgan].y = (patientOrganList[pOrgan].y - sceneCenter[1]);
				patientOrganList[pOrgan].z = (patientOrganList[pOrgan].z - sceneCenter[2]);
			}
		}

		var sceneCenter = [0.0, 0.0, 0.0];
		var xyzMin = new Array(3);
		var xyzMax = new Array(3);
		var positions = [];
		//shifts organs in organ atlas also?  couldn't this just be hard coded?
		for (var pOrgan in oAtlas) {
			var xyz = {
				x: oAtlas[pOrgan].x,
				y: oAtlas[pOrgan].y,
				z: oAtlas[pOrgan].z
			};
			positions.push(xyz);
		}
		xyzMin = getMin(positions);
		xyzMax = getMax(positions);
		sceneCenter = [
			((xyzMin[0] + xyzMax[0]) / 2),
			((xyzMin[1] + xyzMax[1]) / 2),
			((xyzMin[2] + xyzMax[2]) / 2)
			];

		for (var pOrgan in oAtlas) {
			oAtlas[pOrgan].x = (oAtlas[pOrgan].x - sceneCenter[0]);
			oAtlas[pOrgan].y = (oAtlas[pOrgan].y - sceneCenter[1]);
			oAtlas[pOrgan].z = (oAtlas[pOrgan].z - sceneCenter[2]);
		}
	}
	flipGraph();
    computeCenterOfGraphAndShift(); // compute center of graph and shift to origin
	return functions;
};