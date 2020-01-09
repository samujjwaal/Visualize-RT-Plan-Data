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
var medrtobj;
var allPatientDropdownIds;
	
var selectedPatient = 99992;

var patientsToShow = 7;

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

var organs,  links;
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

var data;
var meshes;
var json_patients;

var promises = [];

var bar_index = 200;


d3.json("data/organAtlas.json", function(organs){
	d3.json("data/patient_dataset.json", function(patients){
		json_patients = patients;
		data = Data(patients, organs);
		meshes = loadOrganMeshes();

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
		function bubbleColorChange(selectedPatient){
			let dropdown_value = document.getElementById("bubble_select").value;
			// var groups = ['gender', 'race', 'hpv','overall_survival', 't_category', 'tumor_subsite'];
			let uic = 'brown';
			if(selectedPatient == 99992){
				uic = 'black';
			}
			if(dropdown_value == 'gender'){
				// console.log('gender');
				d3.select('#bubble').select('svg').select('#bubbles_group').selectAll("circle").style("fill", function(d){
					if(d.dummy_id == selectedPatient){
						return "white";
					}else if (d.dummy_id == 99992){
						if(uic == 'brown'){
							return "#7f3b08";
						}else{
							return "white";
						}						
					}else{
						return color0(d.gender);
					}
					
				});
			}else if(dropdown_value == 'race'){
				// console.log('race');
				d3.select('#bubble').select('svg').select('#bubbles_group').selectAll("circle").style("fill", function(d){
					if(d.dummy_id == selectedPatient){
						return "white";
					}else if (d.dummy_id == 99992){
						if(uic == 'brown'){
							return "#7f3b08";
						}else{
							return "white";
						}						
					}else{
						return color1(d.race);
					}
					
				});
			}else if(dropdown_value == 'hpv'){
				// console.log('hpv');
				d3.select('#bubble').select('svg').select('#bubbles_group').selectAll("circle").style("fill", function(d){
					if(d.dummy_id == selectedPatient){
						return "white";
					}else if (d.dummy_id == 99992){
						if(uic == 'brown'){
							return "#7f3b08";
						}else{
							return "white";
						}						
					}else{
						return color2(d.hpv);
					}
					
				});
			}else if(dropdown_value == 'overall_survival'){
				// console.log('overall_survival');
				d3.select('#bubble').select('svg').select('#bubbles_group').selectAll("circle").style("fill", function(d){
					if(d.dummy_id == selectedPatient){
						return "white";
					}else if (d.dummy_id == 99992){
						if(uic == 'brown'){
							return "#7f3b08";
						}else{
							return "white";
						}						
					}else{
						return color3(d.overall_survival);
					}
					
				});
			}else if(dropdown_value == 't_category'){
				// console.log('t_category');
				d3.select('#bubble').select('svg').select('#bubbles_group').selectAll("circle").style("fill", function(d){
					if(d.dummy_id == selectedPatient){
						return "white";
					}else if (d.dummy_id == 99992){
						if(uic == 'brown'){
							return "#7f3b08";
						}else{
							return "white";
						}						
					}else{
						return color4(d.t_category);
					}
					
				});
			}else if(dropdown_value == 'tumor_subsite'){
				// console.log('tumor_subsite');
				d3.select('#bubble').select('svg').select('#bubbles_group').selectAll("circle").style("fill", function(d){
					if(d.dummy_id == selectedPatient){
						return "white";
					}else if (d.dummy_id == 99992){
						if(uic == 'brown'){
							return "#7f3b08";
						}else{
							return "white";
						}						
					}else{
						return color5(d.tumor_subsite);
					}
					
				});
			}
		}
		function start() {
			bar.init()	;
			bubble.init();
			allPatientDropdownIds = getPatientIDS(patients);
			bar.dropdown(allPatientDropdownIds);	
			bubble.dropdown();          
		 
			 //by default show patient ID 99992's information
			 var onChange = false;
			 if (onChange === false){
				 var organList = getOrganList(200, patients);
				 //mean dose of the organs
				 var organMeanDose = getOrganMeanDose(200, organList, patients);
		 
				 bar_chart(organList, organMeanDose);
				 selectedPatient = 99992;
				 medrtobj.init();
			 }
		 
			 //getting the selected patient index from the drop down
			 var selectedIndex = 0;
			 document.getElementById("select").onchange = function(){
				 onChange = true
				 selectedIndex = this.selectedIndex;
				 bar_index = 200 - selectedIndex;
				//  console.log("bar " + bar_index)
				// console.log(selectedIndex);
				 selectedPatient = allPatientDropdownIds[selectedIndex];
				//  console.log(selectedPatient)
				 bubbleColorChange(selectedPatient);
				 medrtobj.init();
				 organList = getOrganList(bar_index, patients);
			     //mean dose of the organs
				organMeanDose = getOrganMeanDose(bar_index, organList, patients);
				 bar_chart(organList, organMeanDose);
		 
			 };

			currScene = scenes[0];
		
			document.addEventListener("mousedown", onMouseDown, false);
			document.addEventListener("mouseup", onMouseUp, false);
		
			document.addEventListener("touchstart", onTouchStart, false);
			document.addEventListener("touchend", onTouchEnd, false);
		
			document.addEventListener("mousemove", onDocumentMouseMove, false);
		
			animate(); // render

			scene_control.setup();
			
			window.addEventListener('resize', function(d){
				bar_chart(organList, organMeanDose);
				// let b_index = document.getElementById("bubble_select").value;
				// let b_data = bubbledata;
				// console.log(selectedBubbleIndex);
				bubbleplot(selectedBubbleIndex, bubbledata);
				medrtobj.init();
				// scene_control.setup();
			});
			scene_control.toggleBrush(true);
		}
		medrtobj = (function(){
			function medrt(){
				var self = this;
	
			}
			medrt.init = function() {
				
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
				scenes = updateScenes(selectedPatient);
			}
			return medrt;
		})();
		

		function removeOldViews(patient){
			var patientViews = document.getElementsByClassName('list-item');
			var element;
			for(var i = patientViews.length - 1; i >= 0; i--){
				element = patientViews[i];
				element.parentElement.removeChild(element);
			}
		}		

		function updateScenes(selectedPatient){
			removeOldViews(selectedPatient);
			var scenes = [];
			var matches = similarPatients(selectedPatient);
			// console.log(matches)
			for (var i = 0; i < patientsToShow && i < matches.length; i++) {
				var id = matches[i];
				var target = (i == 0)? "leftContent" : "content";
				// var target =  "content";
				var newScene = showPatient(id, target);
				scenes.push(newScene);
			}
			return scenes
		}
		function similarPatients(selectedPatient){
			var count = 1;
			var similarPatients = [];
				for(var patientcount = 0; patientcount < patients.length; patientcount++)
			  {
				if (selectedPatient === patients[patientcount].ID)
				  {
					similarPatients[0] = patients[patientcount].ID_internal;
					for(var j=0; j < patients[patientcount].similar_patients.length; j++)
					{
					  similarPatients[count] = patients[patientcount].similar_patients[j];
					  count++;
					}
				  }
			  }	
			return similarPatients;
			
		  }
		
		function placeOrganModels(pOrgan, organProperties, scene, nodeColor) {
			if (!scene_control.isTumor(pOrgan)) {
				var geometry = meshes[String(pOrgan)];
				let currentOpacity = 0.5;
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
		
		function showPatient(id, parentDivId, camera = null){
			var scene = new THREE.Scene();
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
		
			var scalarVal = 1.72; 
		
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
		
			 //creates the bubbles on the organs
			var outlineSize = 5; //makes a border around the bubbles
			var nodeSize = 4; //size of the bubbles
			var geometry = new THREE.SphereGeometry(nodeSize, 16);
			var outlineGeometry = new THREE.SphereGeometry(outlineSize, 16);
		
			var material = new THREE.MeshStandardMaterial({
				color: new THREE.Color().setHex(0xffffff), 
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
				//this looks like it draws the organs in each patient
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
		
				//format the tumors in the data differently
				if( scene_control.isTumor(organSphere.name) ){
					gtvs.push(organSphere);
					nodeColor = '#4169e1';
					//using real scaling doesn't seem to really work so it's just porportional now
					//tumor size 
					outlineMesh.scale.multiplyScalar( Math.pow(organSphere.userData.volume, .32));
					let tumorOutline = scene_control.getDoseColor(organSphere.userData.meanDose);
					outlineMesh.material.color.set( tumorOutline );
					outlineMesh.material.transparent = true;
					outlineMesh.material.opacity = 0.5;
					outlineMesh.renderOrder = -11;
				} else if (organSphere.userData.meanDose >= 0.0){ 
					nodeColor = scene_control.getDoseColor(organSphere.userData.meanDose);
				}else {
					nodeColor = '#fffff';
					organSphere.userData.meanDose = undefined;
					organSphere.userData.dosePerVolume = undefined;
				}
		
				organSphere.material.color.setStyle(nodeColor);
				// outlineMesh.material.transparent = true;
				// organSphere.material.opacity = 0;
		
				scene.add(organSphere);
				organSphere.add(outlineMesh);
		
				placeOrganModels(pOrgan, patientOrganList[pOrgan], scene, nodeColor);
			}
		
			// var linkMaterial = new THREE.LineBasicMaterial({
			// 	color: 0x3d3d3d,
			// 	opacity: 1,
			// 	linewidth: 2
			// });
		
			// var tmp_geo = new THREE.Geometry();
		
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
			var light = new THREE.AmbientLight(0xffffff, 1.0); 
		
			scene.add(light);
			return scene;
		}
		
		function animate() {
			render();
			requestAnimationFrame(animate);
		}
		
		function render() {
		
			updateSize();
		
			renderer.setClearColor(0xd9d9d9);//will be background color
			renderer.setScissorTest(false);
			renderer.clear();
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
				var element = scene.userData.element;
		
				// get its position relative to the page's viewport
				var rect = element.getBoundingClientRect();
		
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
							scene_control.brushOrgan(intersects[i].object.name);	
		
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
								scene_control.unbrushOrgan(nodeHover.name);
							}
							populateAndPlaceDetails("HIDE");
						}
		
		
					}
				} else {
		
					if (INTERSECTED) {
						scene_control.unbrushOrgan(INTERSECTED.parent.name);
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
		
		function populateAndPlaceDetails(state) {
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
				organName.innerHTML = "<b>"+ nodeHover.name + "</b>";
				// Volume
				volumeVal.innerHTML = rounded(nodeHover.userData.volume) + " cc";
		
				// Mean Dose
				meanDoseVal.innerHTML = rounded(nodeHover.userData.meanDose) +" GY";
		
				// Min Dose
				minDoseVal.innerHTML = rounded(nodeHover.userData.minDose) + " GY";
		
				// Max Dose
				maxDoseVal.innerHTML = rounded(nodeHover.userData.maxDose) + " GY";
		
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
			var similar = similarPatients(selectedPatient);
			var index2 = 0;

			for (var count = 0 ; count < similar.length ; count++){
				if(similar[count] == internalId){
					index2 = count;
				}
			}
			return(index2)
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
				scene_control.setCamera(cameraToCopy);
				syncCamerasInterval = setInterval(scene_control.syncAllCameras, 20, scenes);
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