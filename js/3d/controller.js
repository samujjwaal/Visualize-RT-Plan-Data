var Controller = (function(){
	var scatterData = {};
	var bubbleData = {};
	var enableBrush = false;
	var brushedOrgans = [];
	var gtvRegex = RegExp('GTV*');
	var doseColor = d3v5.scaleLinear()
		.domain([0,70])
		.range(['#f7f7f7','#252525']);
	// var doseErrorColor = d3.scaleLinear()
	// 	.domain([0, 20])
	// 	.range(['#999999','#3d32ff']);
	var currentCamera = null;
	var currentScene = 'Real';
	var isTumor = (string) => gtvRegex.test(string);

	return {

		brushOrgan: function(organ){
			if(isTumor(organ)){
				return;
			}
			try{
				//var axisLine = d3.select( "#" + organ + 'axisLine' );
				//axisLine.attr('stroke', 'white')
					//.attr('stroke-width', .1*OrganBubblePlot.binWidth);
				scenes.forEach(function(scene){
					var node = scene.getObjectByName(organ);
					var model = scene.getObjectByName(organ + '_model');
					//model.material.color.set('white');
					model.material.opacity = 1;
				});
				brushedOrgans.push(organ);
			} catch{
				brushedOrgans.push(organ);
			}
		},

		unbrushOrgan: function(){
			brushedOrgans.forEach(function(organ){
				//var axisLine = d3.select( "#" + organ + 'axisLine' )
				//var currentWidth = axisLine.attr('stroke-width');
				//axisLine.attr('stroke', 'silver')
					//.attr('stroke-width', .05*OrganBubblePlot.binWidth);
				scenes.forEach(function(scene){
					try{
						var node = scene.getObjectByName(organ);
						var model = scene.getObjectByName(organ + '_model');
						var organColor = doseColor(node.userData.meanDose);
						//model.material.color.set(organColor);
						var currentOpacity = document.getElementById("opacSlider").value/100.0;
						model.material.opacity = currentOpacity;
					} catch{}
				});
			});
			brushedOrgans = [];
		},

		loadSavedState: function(scenes){
			//load previous camera view
			this.syncAllCameras(scenes);
			//keep if they were looking at actual vs predicted vs dose error
			this.switchScene(scenes[0], currentScene, data);
			//switch active scene button
			var buttons = document.getElementsByClassName('sceneToggleButton');
			Array.prototype.forEach.call(buttons, function(e){
				e.style.opacity = (e.innerHTML.toLowerCase() == currentScene.toLowerCase())? 1:'';
			});
		},

		switchScene: function(scene, type, data){
			//changes color scheme of main patient to predicted, actual dose or dose error
			var id = scene.userData.element.parentElement.id;
			currentScene = type;
			scene.children.forEach(function(d){
				//if not real dose, make the gtv outline translucent
				if(isTumor(d.name)){
					let organName = d.name;
					let outline = scene.getObjectByName(d.name + '_outline');
					if(outline.material != undefined){
						if(type.toLowerCase() != 'pred.' && type.toLowerCase() != 'error'){
						outline.material.opacity = 1;
						} else{
							outline.material.opacity = 0;
						}
					}
				}
				//else, change all the value and colors accordingly
				else if(d.userData.type == 'node'){
					var organName = d.name;
					if(type.toLowerCase() == 'pred.'){
						var dose = data.getEstimatedDose(id, organName);
						var color = doseColor(dose);
					} else if(type.toLowerCase() == 'error'){
						var dose = data.getEstimationError(id, organName);
						var color = doseErrorColor(dose);
					} else{
						var dose = data.getMeanDose(id, organName);
						var color = doseColor(dose);
					}
					d.material.color.set(color);

					d.userData.meanDose = +(dose.toFixed(3));
					d.userData.dosePerVolume = +((dose/data.getOrganVolume(id, organName)).toFixed(3));
					if(type.toLowerCase() == 'real'){
						d.userData.maxDose = +(data.getMaxDose(id, organName).toFixed(3));
						d.userData.minDose = +(data.getMinDose(id, organName).toFixed(3));
					} else{
						d.userData.maxDose = undefined;
						d.userData.minDose = undefined;
					}
					var model = scene.getObjectByName(organName + '_model');
					if(model != undefined){
						model.material.color.set(color);
					}
				}
			});
		},

		getDoseColor: function(d){ return doseColor(d); },

		//getDoseErrorColor: function(d){ return doseErrorColor(d); },

		toggleBrush: function(isEnabled){
			enableBrush = isEnabled;
		},

		brush: function(id){
			if(enableBrush){
				//highlight patient matches in other views on mousover
				var patientView = document.getElementById(id);
				if(patientView != null){
					patientView.style.boxShadow = '0px 5px 5px 10px white';
					var description = patientView.querySelector('.description');
					description.style.color = 'white';;
				}

				// var bubble = d3.selectAll('#organBubble'+id);
				// if(!bubble.empty()){
				// 	bubbleData.fill = bubble.attr('fill');
				// 	bubbleData.stroke = bubble.attr('stroke');
				// 	bubbleData.opacity = bubble.attr('opacity');
				// 	bubble.attr('fill', 'white')
				// 		.attr('stroke', 'white')
				// 		.attr('opacity', 1)
				// 		.moveToFront();
				// }
				// var scatterSelection =  d3.selectAll('path').filter('#scatterDot' + id);
				// if(!scatterSelection.empty()){
				// 	scatterData.stroke = scatterSelection.attr('stroke');
				// 	scatterSelection.attr('stroke', 'white')
				// 		.moveToFront();
				// }
			}
		},

		unbrush: function(id){
			if(enableBrush){
				var patientView = document.getElementById(id);
				if(patientView != null){
					patientView.style.boxShadow = '';
					var description = patientView.querySelector('.description');
					description.style.color = 'black';
				}
				// if(!d3.selectAll('#organBubble'+id).empty()){
				// 	d3.selectAll('#organBubble'+id)
				// 		.attr('fill', bubbleData.fill)
				// 		.attr('stroke', bubbleData.stroke)
				// 		.attr('opacity', bubbleData.opacity);
				// }
				// if(!d3.selectAll('path').filter('#scatterDot' + id).empty()){
				// 	d3.selectAll('path').filter('#scatterDot' + id)
				// 		.attr('stroke', scatterData.stroke);
				// }
				if( !d3.selectAll('.doseRect').empty()){
					d3.selectAll('.doseRect').moveToFront();
				}
				d3.selectAll('.doseRect').filter('.meanDose')
					.attr('fill', data.getClusterColor(selectedPatient))
					.attr('opacity', 1);
			}
		},

		setup: function(){
			//setup general listenrs
			var self = this;
			d3.selectAll('.description').on('mouseover', function(d){
				var id = this.parentNode.parentNode.id;
				self.brush(id);
			}).on('mouseout', function(d){
				var id = this.parentNode.parentNode.id;
				self.unbrush(id);
			}).on('click', function(d){
				var id = this.parentNode.parentNode.id;
				//switchPatient(id); //switching patient after clicking a div of 3D
			});

		},

		setCamera: function(camera){
			currentCamera = camera;
		},

		syncAllCameras: function(scenes){
			if(currentCamera == null){
				return;
			}
			for( var i = 0; i < scenes.length; i++) {
				var scene = scenes[i];
				var camera = scene.userData.camera;
				var controls = scene.userData.controls;

				camera.position.subVectors(currentCamera.position, controls.target);
				//camera.position.setLength(cameraDistZ);
				camera.lookAt(scene.position);
			};
		},

		isTumor: isTumor
	}
})();