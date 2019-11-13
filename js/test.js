d3.json("data/patient_dataset.json").then(function(patients) {
    var scenes = [],
    renderer;
	
    var selectedPatient = 1;
    //patients shown on load screen?
    var patientsToShow = 11;

    var totalModelCount;

    var syncCameras = true,
        syncCamerasInterval,
        detailsOnRotate = true;

    var raycaster;

    var mouse = new THREE.Vector2(-500, -500);

    var mouseNorm = new THREE.Vector2(-500, -500),
        INTERSECTED = null,
        nodeHover = null;

    var cameraDistZ = 500;
    // data
    var organs, oAtlas, links;
    var organModels = new THREE.Group();

    var partitions = ["Oral Cavity & Jaw", "Throat", "Salivary Glands", "Eyes", "Brainstem & Spinal Cord", "Other"];

    var organRef = [];
    var currScene;

    var master = document.getElementById("masterList");

    var materialArray;

    var canvas = document.getElementById("c");
    var template = document.getElementById("template").text;

    var manager = new THREE.LoadingManager();
    var currentCamera = null;

    var meshes;

});

function loadOrganMeshes(){
	let loader = new THREE.VTKLoader(manager);
	let organs = data.getOrganList();
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

function init() {
	//renderer for main views?
	var getRenderer = function(canvas, isAlpha){
		var r = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true,
			alpha: isAlpha
		});
		r.setClearColor(0x888888, 1);
		r.setPixelRatio(window.devicePixelRatio);
		r.sortObjects = true;
		return r
	}
    
	renderer = getRenderer(canvas, false);

    raycaster = new THREE.Raycaster();

    var maxAnisotropy = renderer.getMaxAnisotropy();

    var textureLoader = new THREE.TextureLoader();

    var texture0 = textureLoader.load('resources/anterior.png'), // xpos, Right
        texture1 = textureLoader.load('resources/posterior.png'), // xneg, Left
        texture2 = textureLoader.load('resources/superior.png'), // ypos, Top
        texture3 = textureLoader.load('resources/inferior.png'), // yneg, Bottom
        texture4 = textureLoader.load('resources/right.png'), // zpos, Back
        texture5 = textureLoader.load('resources/left.png'); // zneg, Front

    texture0.anisotropy = maxAnisotropy;
    texture1.anisotropy = maxAnisotropy;
    texture2.anisotropy = maxAnisotropy;
    texture3.anisotropy = maxAnisotropy;
    texture4.anisotropy = maxAnisotropy;
    texture5.anisotropy = maxAnisotropy;
    //getcontext2d. draw image
    materialArray = [
            new THREE.MeshBasicMaterial({
            map: texture0
        }),
            new THREE.MeshBasicMaterial({
            map: texture1
        }),
            new THREE.MeshBasicMaterial({
            map: texture2
        }),
            new THREE.MeshBasicMaterial({
            map: texture3
        }),
            new THREE.MeshBasicMaterial({
            map: texture4
        }),
            new THREE.MeshBasicMaterial({
            map: texture5
        })
    ];
    
	scenes = updateScenes(selectedPatient, materialArray);//populates required views	
	updateOrder(selectedPatient);
}

function updateScenes(selectedPatient, material){
	var scenes = []; //scenes is a wonderful global for now
	var matches = data.getPatientMatches(selectedPatient);
	for (var i = 0; i < patientsToShow && i < matches.length; i++) {
		var id = matches[i];
		var target = (i == 0)? "leftContent" : "content";
		var newScene = showPatient(material, id, target);
		scenes.push(newScene);
	}
	return scenes
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

function showPatient(materialArray, id, parentDivId, camera = null){
	//adds a patient view I think
	var scene = new THREE.Scene();
	var patient = data.getPatient(id);
	var patientOrganList = data.getPatientOrganData(id);

	// make a list item
	var element = document.createElement("div");
	element.className = "list-item";
	element.id = id;
	element.innerHTML = template.replace('$', data.getPatientName(id));
	
	var totDoseElement = element.querySelector(".totDose");
	let totalDose = (+data.getTotalDose(id)).toFixed(0);
	totDoseElement.innerHTML = "Dose:" + "<b>" + totalDose + "</b>" + "GY";

	var tVolumeElement = element.querySelector(".tVolume");
	let tVolume = (+data.getTumorVolume(id)).toFixed(1);
	tVolumeElement.innerHTML = "GTV:" + "<b>" + tVolume+ "</b>" + "cc";

	var lateralityElement = element.querySelector(".laterality");
	lateralityElement.innerHTML = "<b>(" + data.getLaterality(id)+ ")</b> " + data.getSubsite(id);

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
		if(data.getOrganVolume(id, pOrgan) <= 0){
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

function getTargetVertices(gtvs){
	//gets the location between the larget node, and the COM of all secondary node
	//passed to that other big function so it can draw a line between them
	var source_position = gtvs[0].clone().position;
	var target_position = null;
	if( gtvs.length > 1 ){
		var gtvn = gtvs[1].clone();
		var target_volume = gtvn.userData.volume;
		target_position = gtvn.position.multiplyScalar(target_volume);
		let gtvn_suffix = 2;
		while( gtvn_suffix < gtvs.length){
			let gtv = gtvs[gtvn_suffix].clone();
			target_volume = gtv.userData.volume + target_volume;
			let new_position = gtv.position.multiplyScalar(gtv.userData.volume);
			target_position.add(new_position);
			gtvn_suffix += 1;
		}
		target_position = target_position.divideScalar(target_volume);
	}
	return [source_position, target_position]
}

function removeOldViews(patient){
	//remove list-items not matched to the patient
	var matches = data.getPatientMatches(patient);
	var patientViews = document.getElementsByClassName('list-item');
	var element;
	for(var i = patientViews.length - 1; i >= 0; i--){
		element = patientViews[i];
		element.parentElement.removeChild(element);
	}
}

function switchPatient(updatedPatient){
	//event to call when a new patient is brought into the focuse
	if(updatedPatient == selectedPatient){ 
		return;
	}
	selectedPatient = updatedPatient;
	document.getElementById("patientMenu").value = selectedPatient
	removeOldViews(updatedPatient); //removes old views
	//waits for new scenes to load
	var sceneLoaded = new Promise( function(resolve, reject){
		Controller.toggleBrush(false);
		var newScenes = updateScenes(selectedPatient, materialArray);//populates required views
		resolve(newScenes);
	});
	sceneLoaded.then(function(newScenes){
		scenes = newScenes;
		updateOrder(updatedPatient);
		initializeRiskPrediction(selectedPatient);
		OrganBubblePlot.switchPatient(updatedPatient);
		scatter.highlightSelectedPatients(updatedPatient); 
		Controller.setup();
		Controller.toggleBrush(true);
		Controller.loadSavedState(scenes, data);
	});
}

function formatFirstPatient(updatedPatient){
	//messes with the html to give the first patient view tabs instead of a sim score
	var firstPatient = document.getElementById(updatedPatient);
	firstPatient.style.display = "none";
	firstPatient.parentElement.insertBefore(firstPatient, firstPatient.parentElement.childNodes[2] );
	firstPatient.style.zIndex = 1;
    firstPatient.querySelector(".pScore").remove();
	var description = firstPatient.querySelector('.description');
	let crossColor = data.getClusterColor(updatedPatient);
	description.innerHTML = description.innerHTML 
		+ '<span style=\'font-size:.9em;padding:0px;margin:0px;color:' 
		+ crossColor 
		+ ';\'>&#10010</span>';//add a colored cross by the selected patients name
	var patientSceneTop = firstPatient.querySelector('.patientSceneTop');
	patientSceneTop.style.gridTemplateColumns = 'auto-fit 1fr 1fr 1fr';
	var buttonNames = ['Real', 'Error', 'Pred.'];
	buttonNames.forEach(function(name,idx){
		var differenceButton = document.createElement('div')
		differenceButton.className = 'sceneToggleButton';
		differenceButton.innerHTML = name;
		differenceButton.style.gridColumnStart = idx + 2;
		differenceButton.style.gridRowStart = 1;
		patientSceneTop.append(differenceButton);
		if(name == 'Real'){
			differenceButton.style.opacity = 1;
		}
	});
	
	d3.selectAll('.sceneToggleButton').on('click', function(){
		var buttons = document.getElementsByClassName('sceneToggleButton');
		Array.prototype.forEach.call(buttons, function(e){
			e.style.opacity = '';
		});
		this.style.opacity = 1;
		Controller.switchScene(scenes[0], this.innerHTML, data);
	});
}

function updateOrder(updatedPatient) {
	//sorts the divs of list-items for the patients based on similarity score
    var lastPatient = document.getElementById(data.getPatientMatches(selectedPatient)[scenes.length - 1]);
    //insert last element from patientMatches in last place (before null)
    try{
		parent.insertBefore(lastPatient, null);
	} catch{
		console.log('insert failed ' + lastPatient);
	}
	var first;
	var second;
	var patientMatches = data.getPatientMatches(selectedPatient);
    for (var i = (scenes.length - 2); i > 0; i--) {

        first = document.getElementById(patientMatches[i]);
        second = document.getElementById(patientMatches[i + 1]);
        // order div elements
        parent.insertBefore(first, second);
		//updates the similarity score for the second patient
        pScoreElement = second.querySelector(".pScore");
        // update patient score
        pScoreElement.innerHTML = data.getFormatedSimilarityScore(selectedPatient, i+1);
        // hide patients
        second.style.display = "none";
    }
	//update similarity for the first non-self match
	if(scenes.length > 1){
		first = document.getElementById(patientMatches[1]);
		var pScoreElement = first.querySelector(".pScore");
		pScoreElement.innerHTML = data.getFormatedSimilarityScore(selectedPatient, i+1);
		first.style.display = "none";
	}
	formatFirstPatient(updatedPatient);
}
function animate() {
    render();
    requestAnimationFrame(animate);
}

function render() {

    updateSize();

    renderer.setClearColor(0xbbbbbb);//will be background color
    renderer.setScissorTest(false);
    renderer.clear();
	let plotBackgroundColor = getComputedStyle(document.body).getPropertyValue('--plot-background-color');
	plotBackgroundColor = parseInt( plotBackgroundColor.replace('#','0x'), 16);
    renderer.setClearColor( plotBackgroundColor );//will be color in viewport?
    renderer.setScissorTest(true);

    updateMainView();
	
}

function updateMainView(rotMatrix) {
	//roates views, also does hover event and brushing for nodes
	var raycaster = new THREE.Raycaster();
    var rotMatrix = new THREE.Matrix4();

	for (var index = 0; index < scenes.length; index++) {
		var scene = scenes[index];
		var controls = scene.userData.controls;
		var camera = scene.userData.camera;

		var orientMarkerCube = camera.children[0];

		// get the element that is a place holder for where we want to
		// draw the scene
		var element = scene.userData.element;

		// get its position relative to the page's viewport
		var rect = element.getBoundingClientRect();

		// check if it's offscreen. If so skip it
		if (rect.bottom < 0 || rect.top > renderer.domElement.clientHeight ||
			rect.right < 0 || rect.left > renderer.domElement.clientWidth) {
			continue; // it's off screen
		}

		// update orientation marker
		rotMatrix.extractRotation(controls.object.matrix);
		orientMarkerCube.rotation.setFromRotationMatrix(rotMatrix.transpose());

		// set the viewport
		var width = rect.right - rect.left;
		var height = rect.bottom - rect.top;
		var left = rect.left;
		var bottom = renderer.domElement.clientHeight - rect.bottom;

		renderer.setViewport(left, bottom, width, height);
		renderer.setScissor(left, bottom, width, height);

		// raycaster
		raycaster.setFromCamera(mouseNorm, currScene.userData.camera);

		var intersects = raycaster.intersectObjects(currScene.children);
		//this uses raycasting to find hover events for the organ centroids
		//I've adapted the orignal code so it passes normal organs to a controller brush function
		//I've changed outlines from turning blue to being opaque so it works on tumors since those are just spheres with outlines
		if (intersects.length >= 1 && detailsOnRotate) {
			for (var i = intersects.length - 1; i >= 0; i--) {

				if (intersects[i].object.userData.type == "node") {
					Controller.brushOrgan(intersects[i].object.name);
					

					nodeHover = intersects[i].object;
					var tempObject = scene.getObjectByName(nodeHover.name + "_outline");

					if (INTERSECTED != tempObject) {

						if (INTERSECTED) {
							INTERSECTED.material.opacity = INTERSECTED.currentOpacity;
						}

						INTERSECTED = tempObject;

						if (INTERSECTED) {
							INTERSECTED.currentOpacity = INTERSECTED.material.opacity;
							INTERSECTED.material.opacity = 1;
						}

						// details

						populateAndPlaceDetails("SHOW");

					}
				
					break;

				} else {
					if(nodeHover != null){
						Controller.unbrushOrgan(nodeHover.name);
					}
					populateAndPlaceDetails("HIDE");
				}
				

			}
		} else {
			
			if (INTERSECTED) {
				Controller.unbrushOrgan(INTERSECTED.parent.name);
				INTERSECTED.material.opacity = INTERSECTED.currentOpacity;
				// details
				populateAndPlaceDetails("HIDE");

			}

			INTERSECTED = null;
		}
		renderer.render(scene, camera);
	}
}

function updateSize() {
	//pretty sure this makes the canvas always the same size as the main thing
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;

    if (canvas.width !== width || canvas.height != height)
        renderer.setSize(width, height, false);
}




