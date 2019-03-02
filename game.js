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
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({canvas:Gfw.getCanvas("main").element});
	renderer.setClearColor(new THREE.Color(0), 1);
		
	// grid
	var geometry = new THREE.CylinderGeometry(0.1, 0.1, 1000, 8, 1);
	var material = new THREE.MeshLambertMaterial({color:0xcccccc});
	var axis;
	// y-axis
	axis = new THREE.Mesh(geometry, material);
	scene.add(axis);
	// x-axis
	axis = new THREE.Mesh(geometry, material);
	axis.rotation.z = Math.PI/2;
	scene.add(axis);
	// z-axis
	axis = new THREE.Mesh(geometry, material);
	axis.rotation.x = Math.PI/2;
	scene.add(axis);
	
	// camera
	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.set(0,0,20);
	camera.lookAt(new THREE.Vector3(0,0,0));
	var controls = new THREE.OrbitControls(camera, Gfw.inputOverlay[0]);
	
    ambientLight = new THREE.AmbientLight(0xFFFFFF);
    ambientLight.intensity = 0.35;
    scene.add(ambientLight);
    
	directionalLight = new THREE.DirectionalLight(0xFFFFFF);
	directionalLight.position.set(0, 20, 20);
	directionalLight.intensity = 1;
	scene.add(directionalLight); 
		
	plot();
	
}

function update(){
	directionalLight.position.set(camera.position.x, camera.position.y, camera.position.z);
	// monitor stuffs
	Monitor.set("FPS", Time.fps);
}

function render(){
	renderer.render(scene, camera);
}

function plot(){
	var scale = {x:1, y:1, z:1};
	var step = {x:0.1, z:0.1};
	// real plot
	var min_x = -20;
	var max_x = 20;
	// imaginary plot
	var min_z = -2.5;
	var max_z = 2.5;
	// objects
	var min = {x:min_x, z:min_z};
	var max = {x:max_x, z:max_z};	
	// num steps
	var numSteps = {};
	numSteps.x = (max.x-min.x)/step.x+1;
	numSteps.z = (max.z-min.z)/step.z+1;	
	// offset
	var offset = {};
	offset.x = min.x;
	offset.z = min.z;
	
	// prepate
	var geometry = new THREE.Geometry(); 
	var material = new THREE.MeshLambertMaterial({
		color:0xff0000, 
		side:THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1
	});
	// plot
	var vector_index = 0;
	var x, y, z, vector;
	var complex = Complex.create();
	var result = Complex.create();
	for(var ix = 0; ix < numSteps.x; ix++){
		for(var iz = 0; iz < numSteps.z; iz++){
			x = ix * step.x + offset.x;
			z = iz * step.z + offset.z;
			Complex.set(complex, x, z);
			f(result, complex);
			y = result.r;
			vector = new THREE.Vector3(x*scale.x, y*scale.y, z*scale.z);
			geometry.vertices.push(vector);
			if(ix > 0 && iz > 0){
				geometry.faces.push(new THREE.Face3(vector_index, vector_index-numSteps.z, vector_index-numSteps.z-1));
				geometry.faces.push(new THREE.Face3(vector_index, vector_index-1, vector_index-numSteps.z-1));
			}
			vector_index++;
		}
	}
	geometry.computeFaceNormals();
	plotMesh = new THREE.Mesh(geometry, material);
	scene.add(plotMesh);
	var wireframeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, wireframe:true});
//	var wireframeGeometry = new THREE.EdgesGeometry(geometry);
	plotWireframe = new THREE.Mesh(geometry, wireframeMaterial);
	// tube
	var tubeGeometry = new THREE.Geometry();
	var tubeMaterial = new THREE.MeshLambertMaterial({
		color:0xffff00, 
		side:THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1
	});
	var numAngles = 8;
	var angle;
	var radius = 0.125;
	// precalc angles
	var angleStep = Math.PI*2/numAngles;
	var cos = [];
	var sin = [];
	for(var ia = 0; ia < numAngles; ia++){
		angle = ia*angleStep;
		cos[ia] = Math.cos(angle);
		sin[ia] = Math.sin(angle);
	}
	// generate tube
	for(var ix = 0; ix < numSteps.x; ix++){
		x = ix * step.x + offset.x;
		Complex.set(complex, x, 0);
		f(result, complex);
		y = result.r;
		for(var ia = 0; ia < numAngles; ia++){
			vector = new THREE.Vector3(x, y+radius*cos[ia], radius*sin[ia]);
			tubeGeometry.vertices.push(vector);
		}
	}
	var n = tubeGeometry.vertices.length;
	for(var ia = 1; ia < numAngles-1; ia++){
		tubeGeometry.faces.push(new THREE.Face3(0, ia, ia+1));
		tubeGeometry.faces.push(new THREE.Face3(n-1, n-1-ia, n-2-ia));
	}
	var off = 0;
	for(var ix = 0; ix < numSteps.x-1; ix++){
		for(var ia = 0; ia < numAngles-1; ia++){
			var i1 = off;
			var i2 = off+1;
			var i3 = i1+numAngles;
			var i4 = i2+numAngles;
			tubeGeometry.faces.push(new THREE.Face3(i1, i2, i3));
			tubeGeometry.faces.push(new THREE.Face3(i2, i3, i4));
			off++;
		}
	}
	tubeGeometry.computeFaceNormals();
	tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
	scene.add(tubeMesh);
}

var z = {
	a: Complex.create(0.5, 0),
};
function f(out, complex){
	// y=a*x^2
	Complex.set(out, complex.r, complex.i); // out=z
	Complex.multiply(out, out); // out=z*z
	Complex.multiply(out, z.a); // out=z*z*a
	// y=x
//	Complex.set(out, complex.r, complex.i); // out=z
	// y=sin(x)
//	Complex.sin(out, complex); // out=sin(z)
//	out.r *= 0.1;
	// y=cos(x)
//	Complex.cos(out, complex); // out=cos(z)
//	out.r *= 0.5;
	// return
	return out.r;
}






































