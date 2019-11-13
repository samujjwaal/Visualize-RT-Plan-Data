var scenes = [],
    rendered;

var selectedPatient = 1;
var syncCameras = true,
    syncCamerasInterval,
    detailOnRotate = true;

var raycaster;
var mouse = new THREE.Vector2(-500, -500);
var mouseNorm = new THREE.Vector2(-500, -500),
    INTERSECTED = null,
    nodeHover = null;

var camraDistZ = 500;

//data
var organs, oAtlas, links;
var organModels = new THREE.GROUP();

var partitions = ["Oral Cavity & Jaw", "Throat", "Salivary Glands", "Eyes", "Brainstem & Spinal Cord", "Other"];

var canvas = document.getElementById("c");

var data;
var meshes;
var files = ["data/organAtlas.json", "data/patient_dataset.json"];

files.forEach(function(url){
    oAtlas = values[0][0];
    data = Data(values[1], oAtlas);
    meshes = loadOrganMeshes();
});

