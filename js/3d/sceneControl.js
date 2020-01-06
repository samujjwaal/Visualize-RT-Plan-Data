var scene_control = (function(){
	var enableBrush = false;
	var brushedOrgans = [];
	var gtvRegex = RegExp('GTV*');
	var doseColor = d3.scale.linear()
		.domain([0,70])
		.range(['#fee391','#662506']);
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

		setup: function(){
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