var Data = function(patientData, oAtlas) {
	var pData = patientData;
	var oAtlas = oAtlas;
	var patientCount = pData.length;
	var clusterColors = ['#ffec78', '#464168', '#8dd3c7', '#e78ac3', 'blue', '#80b1d3', 'purple', 'green', 'goldenrod', 'steelblue', 'brown', 'silver', 'burlywood', 'greenyellow', 'darkslategray']
	let defaultClusterColor = '#0000000';
	var functions = {

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

		getPatientId: function(internalId){
			var patient = this.getPatient(internalId);
			return +patient.ID;
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
			var gtvRegex = RegExp('GTV*');
			organList = organList.filter(o => !gtvRegex.test(o));
			return organList;
		},
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
			}
		}
		for (var pOrgan in oAtlas) {
			oAtlas[pOrgan] = flip(oAtlas[pOrgan]);
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