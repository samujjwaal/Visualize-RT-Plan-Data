'use strict';

if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
}
//storing everything in like 100 global variables.  The best programming practice.
var parent = document.getElementById("content");
var nodeDetails = document.getElementById("details");

var detailsOffsetX = 15;
var detailsOffsetY = 15;

var organName = document.getElementById("details_organName"),
    dosePerVolume = document.getElementById("details_dosePerVolume"),
    lineSeparator = document.getElementById("details_line"),
    volumeVal = document.getElementById("details_volume_val"),
    meanDoseVal = document.getElementById("details_meanDose_val"),
    minDoseVal = document.getElementById("details_minDose_val"),
    maxDoseVal = document.getElementById("details_maxDose_val"),
    pDisplayed = document.getElementById("pDisplayed");


var scenes = [],
	renderer;
	
var selectedPatient = 3;



//patients shown on load screen?
var patientsToShow = 12;

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
var organs,  links;
var organModels = new THREE.Group();

var partitions = ["Oral Cavity & Jaw", "Throat", "Salivary Glands", "Eyes", "Brainstem & Spinal Cord", "Other"];

var organRef = [];

var currScene;

var master = document.getElementById("masterList");

var materialArray;

var canvas = document.getElementById("c");
console.log(canvas.clientHeight)
// canvas.width  = window.innerWidth;
// canvas.height = window.innerHeight;
//console.log(document.getElementById("template").text())
var template = document.getElementById("template").text;

var manager = new THREE.LoadingManager();
var currentCamera = null;
// manager.onStart = function(url, itemsLoaded, itemsTotal){
// 	document.getElementById("loadScreen").style.display = "block";
// }

var barChart;
var bubbleChart;
var distributionChart;
var data;
var meshes;
//var files = ["data1/organAtlas.json", "data1/patient_dataset.json"];
var promises = [];
//var organs = [];
//var patient_data = [];

d3.json("data/organAtlas.json", function(organs){
	d3.json("data/patient_dataset.json", function(patients){
		
		data = Data(patients, organs);
		meshes = loadOrganMeshes();

		console.log(data)

		manager.onLoad = function () {
			start();
		};
		
		
		
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
		
		function start() {
			bar.init()	;
			bubble.init();
			var ids = getPatientIDS(patients);
			console.log(ids)
			bar.dropdown(ids);		 
		 
			 //by default show patient ID 3's information
			 var onChange = false;
			 if (onChange === false){
				 var organList = getOrganList(0, patients);
				 //console.log(organList);
				 //mean dose of the organs
				 var organMeanDose = getOrganMeanDose(0, organList, patients);
		 
				 bar_chart(organList, organMeanDose);
				 selectedPatient = 3;
				 init();
		 
				 //organ_threeD(0, patients, organList)
				 //console.log(patients[2].organData.Brainstem);
			 }
		 
			 //getting the selected patient index from the drop down
			 var selectedIndex = 0;
			 document.getElementById("select").onchange = function(){
				 onChange = true
				 //alert(this.selectedIndex);
				 selectedIndex = this.selectedIndex;
				 console.log(ids[selectedIndex])
				//  selectedPatient = ids[selectedIndex];
				selectedPatient = ids[selectedIndex];
				 init(); 
				 // console.log(selectedPatientId);
		 
				 //console.log(patients.keys(patients[0].organData));
				 organList = getOrganList(selectedIndex, patients);
				 //console.log(organList);
				 //mean dose of the organs
				 organMeanDose = getOrganMeanDose(selectedIndex, organList, patients);
				 bar_chart(organList, organMeanDose);
		 
			 };
			
		
			//selectedPatient = populateDropDownMenu();
			// console.log(selectedPatient);
			
			// initialize
			
			currScene = scenes[0];
		
			document.addEventListener("mousedown", onMouseDown, false);
			document.addEventListener("mouseup", onMouseUp, false);
		
			document.addEventListener("touchstart", onTouchStart, false);
			document.addEventListener("touchend", onTouchEnd, false);
		
			document.addEventListener("mousemove", onDocumentMouseMove, false);
		
			animate(); // render
					
			// distribution.init();
			

			
			Controller.setup();
			
			window.addEventListener('resize', function(d){
				bar.init()	;
				bubble.init();		
				// distribution.init();	
				Controller.setup();
			});
			//initializeRiskPrediction(selectedPatient);
			//document.getElementById("loadScreen").style.display = "none";
			Controller.toggleBrush(true);
		}
		
		
		// ----------------------------------------------------------------
		
		// function populateDropDownMenu() {
		// 	//holds an array of patient internal ids
		// 	var menu = document.getElementById("patientMenu");
		// 	// copy of patients sorted
		// 	console.log(menu)
		// 	var patients_sorted = data.getInternalIdList();
		// 	patients_sorted.forEach(function (patient) {
		// 		var tempOption = document.createElement("option");
		// 		tempOption.value = patient;
		// 		tempOption.innerHTML = data.getPatientName(patient);
		// 		menu.appendChild(tempOption);
		// 	});
		
		// 	// first patient
		// 	var firstPatient = patients_sorted[0];
		// 	//THis appears to look at the url to see if a patient is selected there
		// 	//if so, sets "first patient" to this guy? otherwise, uses the lowest id (above)
		// 	var patientURL = getQueryVariable("id");
		// 	if (patientURL > -1) {
		// 		let newId = data.getInternalId(+patientURL);
		// 		if(newId > -1){
		// 			firstPatient = newId;
		// 		}
		// 	}
		// 	menu.value = firstPatient;
		// 	return firstPatient;
		// }
		//getting patients id
		function getQueryVariable(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split("?");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return +pair[1];
				}
			}
			return -1;
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
		
			// var target = "content";
			// var id = 10;
			// var newScene = showPatient(id, target);
			// scenes.push(newScene);
			// return scenes;
			// var index = getIndex();
			// console.log(index)
			
			// var selectedPatient = 1;
			scenes = updateScenes(selectedPatient);
			//updateOrder(selectedPatient);
		}

		function removeOldViews(patient){
			//remove list-items not matched to the patient
			// var matches = similarPatients(patient);
			var patientViews = document.getElementsByClassName('list-item');
			var element;
			for(var i = patientViews.length - 1; i >= 0; i--){
				element = patientViews[i];
				element.parentElement.removeChild(element);
			}
		}
		

		function updateScenes(selectedPatient){
			removeOldViews(selectedPatient)
			var scenes = []; //scenes is a wonderful global for now
			console.log(similarPatients(selectedPatient))
			var matches = similarPatients(selectedPatient);
			// var matches2 = data.getPatientMatches(selectedPatient);
			// console.log(matches2)
			for (var i = 0; i < patientsToShow && i < matches.length; i++) {
				var id = matches[i];
				var target = (i == 0)? "leftContent" : "content";
				// var target = (i == 0)? "leftContent" : "content";
				var newScene = showPatient(id, target);
				scenes.push(newScene);
			}
			return scenes
		}
		function similarPatients(selectedPatient){
			var count = 1;
			var similarPatients = [];			
				//console.log('count1');
				for(var patientcount = 0; patientcount < patients.length; patientcount++)
			  {
				if (patients[patientcount].ID === selectedPatient)
				  {
				   //console.log(patients[patientcount].similar_patients); 
					similarPatients[0] = patients[patientcount].ID_internal;
					for(var j=0; j < patients[patientcount].similar_patients.length; j++)
					{
					  similarPatients[count] = patients[patientcount].similar_patients[j];
					  //console.log('similar patient ' + count + ' is ' + similarPatients[count]);
					  count++;
					}
				  }
			  }
			  //console.log('similar patient is ' + similarPatients);		
			return similarPatients;
			
		  }
		
		function placeOrganModels(pOrgan, organProperties, scene, nodeColor) {
			if (!Controller.isTumor(pOrgan)) {
				var geometry = meshes[String(pOrgan)];
				// let currentOpacity = document.getElementById('opacSlider').value / 100.0;
				let currentOpacity = 0.8;
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
		
		function showPatient(/*materialArray,*/id, parentDivId, camera = null){
			//adds a patient view I think
			var scene = new THREE.Scene();
			// var patient = data.getPatient(id);
			var patientOrganList = data.getPatientOrganData(id);
		
			// make a list item
			var element = document.createElement("div");
			element.className = "list-item";
			element.id = id;
			element.innerHTML = template.replace('$', data.getPatientName(id));
		
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
				color: new THREE.Color().setHex(0xffffff), //changed from 0xa0a0a0
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
					nodeColor = '#542788';
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
					nodeColor = '#fffff';
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
		
		
		
			// check for missing data
			for (var organ in organs) {
		
				if (!patientOrganList.hasOwnProperty(organ)) {
		
					// node
					var organSphere = new THREE.Mesh(geometry, material.clone());
		
					organSphere.position.x = (organs[organ].x);
					organSphere.position.y = (organs[organ].y);
					organSphere.position.z = (organs[organ].z);
		
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
		
					placeOrganModels(organ, organs[organ], scene, nodeColor);
				}
			}
		
			scene.add(camera);
		
			// light
			var light = new THREE.AmbientLight(0xffffff, 1.0); // white light
		
			scene.add(light);
			return scene;
		}
		
		function animate() {
			render();
			requestAnimationFrame(animate);
		}
		
		function render() {
		
			updateSize();
		
			renderer.setClearColor(0xffffff);//will be background color
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
		
				//var orientMarkerCube = camera.children[0];
		
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
				//orientMarkerCube.rotation.setFromRotationMatrix(rotMatrix.transpose());
		
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
			//console.log(canvas.clientwidth)
			var height = canvas.clientHeight;
		
			if (canvas.width !== width || canvas.height != height)
				renderer.setSize(width, height, false);
		}
		
		function populateAndPlaceDetails(state) {
			//I think this is hte organ-centroid tooltip
			if (state == "SHOW") {
				nodeDetails.style.display = "block";
				// PLACEMENT
				// check if details are offscreen, then shift appropriately
				// X, add 10 pixels for buffer, since width is dynamic
				if (mouse.x + detailsOffsetX + nodeDetails.offsetWidth + 5 >= canvas.clientWidth) {
					nodeDetails.style.left = (mouse.x - detailsOffsetX - nodeDetails.offsetWidth) + "px";
				} else {
					nodeDetails.style.left = (mouse.x + detailsOffsetX) + "px";
				}
		
				// Y
				if (mouse.y + detailsOffsetY + nodeDetails.offsetHeight + 5 >= canvas.clientHeight) {
					nodeDetails.style.top = (mouse.y - detailsOffsetY - nodeDetails.offsetHeight) + "px";
				} else {
					nodeDetails.style.top = (mouse.y + detailsOffsetY) + "px";
				}
		
				// fills in tooltip values when hovering over an organ node
				var rounded = function(value){ //applies to fixed with error checking if value is undefined
					if(value == undefined || value == '' || value == null){
						return('N/A');
					} else{
						return (+value).toFixed(1)
					}
				}
				// Organ name
				organName.innerHTML = nodeHover.name;
		
				// Dose Per Volume
				dosePerVolume.innerHTML = nodeHover.userData.dosePerVolume;
		
				// line separator
				lineSeparator.style["borderColor"] = "#" + nodeHover.material.color.getHexString();
		
				// Volume
				volumeVal.innerHTML = rounded(nodeHover.userData.volume) + "";
		
				// Mean Dose
				meanDoseVal.innerHTML = rounded(nodeHover.userData.meanDose) + "  GY";
		
				// Min Dose
				minDoseVal.innerHTML = rounded(nodeHover.userData.minDose) + "";
		
				// Max Dose
				maxDoseVal.innerHTML = rounded(nodeHover.userData.maxDose) + "";
		
			} else if (state == "HIDE") {
				nodeDetails.style.display = "none";
				nodeDetails.style.top = -500 + "px";
				nodeDetails.style.left = -500 + "px";
			}
		}
		
		function onMouseDown(event) {
			if (event.target) {
				detailsOnRotate = false;
				handleInputRotate(event);
			}
		}
		
		function onTouchStart(event) {
			if (event.target) {
				detailsOnRotate = false;
				handleInputRotate(event);
			}
		}
		
		function getSceneIndex(internalId){
			//gets the index in the scene list from a given internal id
			var index = data.getPatientMatches(selectedPatient).indexOf( +internalId )
			return(index)
		}
		
		function handleInputRotate(event) {
		
			var targ = event.target,
				cameraToCopy;
		
			if (targ.className == "scene" && syncCameras == true) {
				var index;
				if (targ.parentNode.hasAttribute("id")) {
					index = getSceneIndex( +targ.parentNode.id );
					cameraToCopy = scenes[index].userData.camera;
				}
				else{
					cameraToCopy = scenes[scenes.length - 1].userData.camera;
				}
				Controller.setCamera(cameraToCopy);
				// 20 milliseconds interval => 50 FPS
				syncCamerasInterval = setInterval(Controller.syncAllCameras, 20, scenes);
			}
		}
		
		
		function onMouseUp(event) {
			detailsOnRotate = true;
			clearInterval(syncCamerasInterval);
		}
		
		function onTouchEnd(event) {
			detailsOnRotate = true;
			clearInterval(syncCamerasInterval);
		}
		
		function onDocumentMouseMove(event) {
			if (event.target) {
		
				var targ = event.target;
		
				if (targ.className == "scene") {
		
					let index = getSceneIndex(+targ.parentNode.id);
					currScene = (index > -1)? scenes[index]: scenes[scenes.length-1];
		
					mouse.x = event.clientX;
					mouse.y = event.clientY;
		
					mouseNorm.x = (event.offsetX / targ.offsetWidth) * 2 - 1;
					mouseNorm.y = -(event.offsetY / targ.offsetHeight) * 2 + 1;
				}
			}
		}
		
	});
	
});



