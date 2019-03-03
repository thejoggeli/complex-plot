var scene, camera, renderer;
var plotMesh = null;
var plotWireframe = null;
var tubeMesh = null;
var tubeWireframe = null;
var ambientLight, directionalLight;

$(document).ready(function(){
	Monitor.setup({showTitle: false});
	// setup Gfw 
	Gfw.setup({height:256});
	Gfw.createCanvas("main", {"renderMode": RenderMode.None});
	Gfw.getCanvas("main").setActive();
	Gfw.onUpdate = update;
	Gfw.onRender = render;
	Gfw.onResize = resize;
	// init
	Ui.init();
	init();
	// start
	Gfw.start();	
});

function resize(){
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.far = 5000;
	camera.near = 0.1;
	camera.fov = 90/(window.innerWidth/window.innerHeight)*(16.0/9.0); // left-right fov at 16:9 = 90°
	camera.updateProjectionMatrix();
}

function init(){
	// plot shader
	THREE.ShaderLib.imaginaryPlot = {
		uniforms: THREE.ShaderLib.lambert.uniforms,
		vertexShader: CustomShaders.imaginaryPlot.vertexShader,
		fragmentShader: CustomShaders.imaginaryPlot.fragmentShader,
	}; 
	
	// scene
	scene = new THREE.Scene();
	
	// renderer
	renderer = new THREE.WebGLRenderer({canvas:Gfw.getCanvas("main").element});
	renderer.setClearColor(new THREE.Color(0), 1);
	
	// camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(5,5,10);
	camera.lookAt(new THREE.Vector3(0,0,0));
	var controls = new THREE.OrbitControls(camera, Gfw.inputOverlay[0]);
	
    ambientLight = new THREE.AmbientLight(0xFFFFFF);
    ambientLight.intensity = 0.35;
    scene.add(ambientLight);
    
	directionalLight = new THREE.DirectionalLight(0xFFFFFF);
	directionalLight.position.set(0, 20, 20);
	directionalLight.intensity = 1;
	scene.add(directionalLight); 
		
	Grid.build();
	Plotter.plot($(".expression-input").val());
	
}

function update(){
	directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
	// monitor stuffs
	Monitor.set("FPS", Time.fps);
}

function render(){
	renderer.render(scene, camera);
}


































