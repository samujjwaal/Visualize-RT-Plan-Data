var scene_control = (function(){
	var enableBrush = false;
	var brushedOrgans = [];
	var gtvRegex = RegExp('GTV*');
	var doseColor = d3.scale.linear()
		.domain([0,70])
		.range(['#fef0d9','#b30000']);
	var currentCamera = null;
	var currentScene = 'Real';
	var isTumor = (string) => gtvRegex.test(string);

	return {

		brushOrgan: function(organ){
			if(isTumor(organ)){
				return;
			}
			try{
				scenes.forEach(function(scene){
					var node = scene.getObjectByName(organ);
					var model = scene.getObjectByName(organ + '_model');
					model.material.opacity = 0.5;
				});
				brushedOrgans.push(organ);
			} catch{
				brushedOrgans.push(organ);
			}
		},

		unbrushOrgan: function(){
			brushedOrgans.forEach(function(organ){
				scenes.forEach(function(scene){
					try{
						var node = scene.getObjectByName(organ);
						var model = scene.getObjectByName(organ + '_model');
						var organColor = doseColor(node.userData.meanDose);
						var currentOpacity = document.getElementById("opacSlider").value/100.0;
						model.material.opacity = 1;
					} catch{}
				});
			});
			brushedOrgans = [];
		},

		getDoseColor: function(d){ return doseColor(d); },

		//getDoseErrorColor: function(d){ return doseErrorColor(d); },

		toggleBrush: function(isEnabled){
			enableBrush = isEnabled;
		},

		// brush: function(id){
		// 	if(enableBrush){
		// 		//highlight patient matches in other views on mousover
		// 		var patientView = document.getElementById(id);
		// 		if(patientView != null){
		// 			patientView.style.boxShadow = '0px 5px 5px 10px white';
		// 			var description = patientView.querySelector('.description');
		// 			description.style.color = 'white';;
		// 		}
		// 	}
		// },

		// unbrush: function(id){
		// 	if(enableBrush){
		// 		var patientView = document.getElementById(id);
		// 		if(patientView != null){
		// 			patientView.style.boxShadow = '';
		// 			var description = patientView.querySelector('.description');
		// 			description.style.color = 'black';
		// 		}
		// 		if( !d3.selectAll('.doseRect').empty()){
		// 			d3.selectAll('.doseRect').moveToFront();
		// 		}
		// 		d3.selectAll('.doseRect').filter('.meanDose')
		// 			.attr('fill', data.getClusterColor(selectedPatient))
		// 			.attr('opacity', 1);
		// 	}
		// },

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