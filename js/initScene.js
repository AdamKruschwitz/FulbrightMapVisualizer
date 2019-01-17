//import * as THREE from "../libs/three";

const width = 960,
    height = 960;

var canvas = document.createElement( 'canvas' ),
    context = canvas.getContext( 'webgl2' ),
    light = new THREE.DirectionalLight( 0xffffff ),
    scene = new THREE.Scene,
    camera = new THREE.PerspectiveCamera(70, width / height, 1, 1000),
    renderer = new THREE.WebGLRenderer({alpha: true, canvas: canvas, context: context}),
    ObjLoader = new THREE.OBJLoader(),
    pivot = new THREE.Object3D();

light.position.set( 0, 0, 1 );
scene.add( light );

camera.position.z = 600;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

scene.add(pivot);

//makeArrowsFromPlaces(20);
//makeArrowsFromPlaces(1);
makeArrowsFromAllData();
arrowsUpdate();

renderer.render(scene, camera);