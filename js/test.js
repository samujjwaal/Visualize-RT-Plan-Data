d3.json("data/patient_dataset.json").then(function(patients) {
    var tumor_volume = getTumorVolume(patients);
    console.log(tumor_volume);
});

function loadOrganMeshes(){
	let loader = new THREE.VTKLoader(manager); /**look for something other than manager */
	let organs = data.getOrganList(); //function
	var meshes = {};
	organs.forEach(function(organ){
		loader.load('resources/models/' + organ + '.vtk', function(geometry){
			geometry.computeVertexNormals();
            geometry.center();

			meshes[String(organ)] = geometry;
		});
	});
	return meshes;
}

function showPatient(materialArray, id, parentDivId, camera = null){
	//adds a patient view I think
	var scene = new THREE.Scene();
	var patient = data.getPatient(id); //create a function getPatient()
	var patientOrganList = data.getPatientOrganData(id); //create a function

	// make a list item
	var element = document.createElement("div");
	element.className = "list-item";
	element.id = id;
	element.innerHTML = template.replace('$', data.getPatientName(id));//function
	
	var totDoseElement = element.querySelector(".totDose"); 
	let totalDose = (+data.getTotalDose(id)).toFixed(0); //function
	totDoseElement.innerHTML = "Dose:" + "<b>" + totalDose + "</b>" + "GY";

	var tVolumeElement = element.querySelector(".tVolume");
	let tVolume = (+data.getTumorVolume(id)).toFixed(1); //function
	tVolumeElement.innerHTML = "GTV:" + "<b>" + tVolume+ "</b>" + "cc";

	var lateralityElement = element.querySelector(".laterality");
	lateralityElement.innerHTML = "<b>(" + data.getLaterality(id)+ ")</b> " + data.getSubsite(id); //function

	// Look up the element that represents the area
	// we want to render the scene
	scene.userData.element = element.querySelector(".scene");
	
	if(!document.getElementById( element.id )){
		document.getElementById(parentDivId).appendChild(element);
	}

	var scalarVal = 2.4; //4.1
	
	var camera = new THREE.OrthographicCamera(scene.userData.element.offsetWidth / -scalarVal, 
		scene.userData.element.offsetWidth / scalarVal, 
		scene.userData.element.offsetHeight / scalarVal, 
		scene.userData.element.offsetHeight / -scalarVal, 
		1, 100000);
		
	camera.position.z = cameraDistZ;
	
	camera.updateProjectionMatrix();
	scene.userData.camera = camera;

	// orientation marker, patient coordinate system
	var MovingCubeMat = new THREE.MultiMaterial(materialArray);
	var MovingCubeGeom = new THREE.CubeGeometry(25, 25, 25, 1, 1, 1, materialArray);
	var MovingCube = new THREE.Mesh(MovingCubeGeom, MovingCubeMat);

	camera.add(MovingCube);
	MovingCube.position.set(90, -90, -260);

	//
	var controls = new THREE.OrbitControls(scene.userData.camera, scene.userData.element);
	controls.minDistance = 2;
	controls.maxDistance = 5000;
	controls.enablePan = false;
	controls.enableZoom = false;

	scene.userData.controls = controls;

	var outlineSize = 5.5;
	var nodeSize = 4;
	var geometry = new THREE.SphereGeometry(nodeSize, 16);
	var outlineGeometry = new THREE.SphereGeometry(outlineSize, 16);

	var material = new THREE.MeshStandardMaterial({
		color: new THREE.Color().setHex(0xa0a0a0),
		roughness: 0.5,
		metalness: 0,
		shading: THREE.FlatShading
	});

	var outlineMaterial = new THREE.MeshBasicMaterial({
		color: 0x3d3d3d,
		side: THREE.BackSide
	});
	
	var gtvs = [];
	for (var pOrgan in patientOrganList) {
		//this looks like it draws the organs in each patient?
		if(data.getOrganVolume(id, pOrgan) <= 0){ //function
			continue;
		}
		var organSphere = new THREE.Mesh(geometry, material.clone());
		
		organSphere.position.x = (patientOrganList[pOrgan].x);
		organSphere.position.y = (patientOrganList[pOrgan].y);
		organSphere.position.z = (patientOrganList[pOrgan].z);

		organSphere.name = pOrgan;
		organSphere.userData.type = "node";
		
		//Small outline for the circle at the centeroid of the organs
		var outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial.clone());

		outlineMesh.name = pOrgan + "_outline";

		// color
		var nodeColor;

		organSphere.userData.volume = data.getOrganVolume(id, pOrgan);
		organSphere.userData.minDose = data.getMinDose(id, pOrgan);
		organSphere.userData.meanDose = data.getMeanDose(id, pOrgan);
		organSphere.userData.maxDose = data.getMaxDose(id, pOrgan);
		organSphere.userData.estimatedDose = data.getEstimatedDose(id, pOrgan);
		// do this in python script maybe
		//grays are already in joules per kilogram?!?!? I might want to delete this because it's misleading to users
		organSphere.userData.dosePerVolume = (data.getMeanDose(id, pOrgan) / data.getOrganVolume(id, pOrgan)).toFixed(3);
		
		//format the tumors in the data differently
		if( Controller.isTumor(organSphere.name) ){
			gtvs.push(organSphere);
			nodeColor = 'black';
			//using real scaling doesn't seem to really work so it's just porportional now
			outlineMesh.scale.multiplyScalar( Math.pow(organSphere.userData.volume, .333));
			let tumorOutline = Controller.getDoseColor(organSphere.userData.meanDose);
			outlineMesh.material.color.set( tumorOutline );
			outlineMesh.material.transparent = true;
			outlineMesh.material.opacity = .5;
			outlineMesh.renderOrder = -11;
		} else if (organSphere.userData.meanDose >= 0.0){ //null == -1 in json, pearson problems
			nodeColor = Controller.getDoseColor(organSphere.userData.meanDose);
		}else {
			nodeColor = '#a0a0a0'; 
			organSphere.userData.meanDose = undefined;
			organSphere.userData.dosePerVolume = undefined;
		}

		organSphere.material.color.setStyle(nodeColor);

		scene.add(organSphere);
		organSphere.add(outlineMesh);

		placeOrganModels(pOrgan, patientOrganList[pOrgan], scene, nodeColor);
	}
	
	var linkMaterial = new THREE.LineBasicMaterial({
		color: 0x3d3d3d,
		opacity: 1,
		linewidth: 2
	});

	var tmp_geo = new THREE.Geometry();

	var [source_position, target_position] = getTargetVertices(gtvs);

	if (source_position != null && target_position != null) {
		//draws a line between the gtvp and gtvn if they are there
		tmp_geo.vertices.push(source_position);
		tmp_geo.vertices.push(target_position);

		var line = new THREE.LineSegments(tmp_geo, linkMaterial);
		scene.add(line);
	}

	// check for missing data
	for (var organ in oAtlas) {

		if (!patientOrganList.hasOwnProperty(organ)) {

			// node
			var organSphere = new THREE.Mesh(geometry, material.clone());

			organSphere.position.x = (oAtlas[organ].x);
			organSphere.position.y = (oAtlas[organ].y);
			organSphere.position.z = (oAtlas[organ].z);

			organSphere.name = organ;
			organSphere.userData.type = "node";

			// outline
			var outlineMesh = new THREE.Mesh(geometry, outlineMaterial.clone());

			outlineMesh.name = organ + "_outline";

			if (organSphere.name == "GTVp")
				outlineMesh.scale.multiplyScalar(1.6);
			else if (organSphere.name == "GTVn")
				outlineMesh.scale.multiplyScalar(1.5);
			else
				outlineMesh.scale.multiplyScalar(1.3);

			// color
			var nodeColor = '#a0a0a0';

			organSphere.userData.volume = undefined;
			organSphere.userData.minDose = undefined;
			organSphere.userData.meanDose = undefined;
			organSphere.userData.maxDose = undefined;
			
			organSphere.userData.estimatedDose = undefined;
			
			organSphere.userData.dosePerVolume = undefined;

			organSphere.material.color.setStyle(nodeColor);

			scene.add(organSphere);
			organSphere.add(outlineMesh);

			placeOrganModels(organ, oAtlas[organ], scene, nodeColor);
		}
	}

	scene.add(camera);

	// light
	var light = new THREE.AmbientLight(0xffffff, 1.0); // white light   

	scene.add(light);
	return scene;
}

function placeOrganModels(pOrgan, organProperties, scene, nodeColor) {
    if (!Controller.isTumor(pOrgan)) {
		var geometry = meshes[String(pOrgan)];
		let currentOpacity = document.getElementById('opacSlider').value / 100.0;
		let material = new THREE.MeshBasicMaterial({
				color: nodeColor,
                opacity: currentOpacity,
                transparent: true,
                depthTest: true,
                depthWrite: true,
                depthFunc: THREE.LessEqualDepth
            });

        let mesh = new THREE.Mesh(geometry, material);
		mesh.name = (String(pOrgan) + "_model");
		mesh.userData.type = "node_model";

		mesh.position.x = organProperties.x;
		mesh.position.y = organProperties.y;
		mesh.position.z = organProperties.z;

		mesh.rotation.x = -Math.PI / 2.0;
		mesh.rotation.z = -Math.PI / 2;
		// oral cavity
		if (pOrgan == "Tongue")
			mesh.renderOrder = -10;
		else if (pOrgan == "Genioglossus_M")
			mesh.renderOrder = -10;
		else if (pOrgan == "Lt_Ant_Digastric_M")
			mesh.renderOrder = -10;
		else if (pOrgan == "Mylogeniohyoid_M")
			mesh.renderOrder = -10;
		else if (pOrgan == "Rt_Ant_Digastric_M")
			mesh.renderOrder = -10;

		else if (pOrgan == "Extended_Oral_Cavity")
			mesh.renderOrder = -9;

		// throat
		else if (pOrgan == "Larynx")
			mesh.renderOrder = -10;
		else if (pOrgan == "Supraglottic_Larynx")
			mesh.renderOrder = -9;


		scene.add(mesh);
	
    }
}

//get functions for all data
function getPatient(id){

}

function getOrganList(){

}

function getPatientOrganData(id){

}

function getPatientName(id){

}

function getTotalDose(id){

}

function getTumorVolume(id){

}

function getLaterality(id){

}
function getSubsite(id){

}

function getOrganVolume(id, pOrgan){

}

function getMinDose(id, pOrgan){

}

function getMeanDose(id, pOrgan){

}

function getMaxDose(id, pOrgan){

}

function getEstimatedDose(id, pOrgan){
    
}
