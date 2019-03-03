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
	var scale = {x:1, y:1, z:5};
			
	// grid
	var geometry = new THREE.CylinderGeometry(0.05, 0.05, 1000, 8, 1);
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
	
	geometry = new THREE.CylinderGeometry(0.04, 0.03, 0.12, 16, 1);
	material = new THREE.MeshLambertMaterial({color:0xcccccc});
	var vectors = [
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, 0, 1),
	];
	for(var v in vectors){
		var vector = vectors[v];
		for(var i = -50; i <= 50; i++){
			axis = new THREE.Mesh(geometry, material);
			axis.position.set(vector.x*i*scale.x, vector.y*i*scale.y, vector.z*i*scale.z);
			scene.add(axis);
			if(v == 1){
				axis.rotation.x = Math.PI/2;
				axis.rotation.z = -Math.PI/2;
				axis.position.x -= 0.06;
			} else {
				axis.position.y -= 0.06;
			}
		}
	}	
	
	var step = {x:0.1, z:0.1};
	// real plot
	var min_x = -25;
	var max_x = 25;
	// imaginary plot
	var min_z = -1;
	var max_z = 0;
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
	
	// plot
	var vector_index = 0;
	var x, y, z, vector;
	var complex = Complex.create();
	var result = Complex.create();
	var imaginaries = [];
	var vertices = [];
	var colors = [];
	var normals = [];
	var indices = [];
	var max_i = -Infinity;
	var min_i = Infinity;
	for(var ix = 0; ix < numSteps.x; ix++){
		for(var iz = 0; iz < numSteps.z; iz++){
			x = ix * step.x + offset.x;
			z = iz * step.z + offset.z;
			Complex.set(complex, x, z);
			f(result, complex);
			y = result.r;
			vertices.push(x*scale.x, y*scale.y, z*scale.z);
			colors.push(1.0, 0.0, 0.0);
			normals.push(0,0,0);
			imaginaries.push(result.i);
			if(ix > 0 && iz > 0){
				indices.push(vector_index, vector_index-numSteps.z, vector_index-numSteps.z-1);
				indices.push(vector_index, vector_index-numSteps.z-1, vector_index-1);
			}
			if(result.i < min_i) min_i = result.i;
			if(result.i > max_i) max_i = result.i;
			vector_index++;
		}
	}	
	// plot geometry
	var bufferGeometry = new THREE.BufferGeometry();
	bufferGeometry.setIndex(indices);
	bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	bufferGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	bufferGeometry.addAttribute('imaginary', new THREE.Float32BufferAttribute(imaginaries, 1));
	bufferGeometry.computeVertexNormals();
	bufferGeometry.normalizeNormals();
	// plot material
	var uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.imaginaryPlot.uniforms);
	uniforms["diffuse"].value.set(0xFF0000);
	uniforms["min_plot_i"] = {value:min_i};
	uniforms["max_plot_i"] = {value:max_i};
	uniforms["plot_i_range"] = {value:max_i-min_i};
	var material = new THREE.ShaderMaterial({
		defines: {},
		uniforms: uniforms,
		vertexShader: THREE.ShaderLib.imaginaryPlot.vertexShader,
		fragmentShader: THREE.ShaderLib.imaginaryPlot.fragmentShader,
		name: 'custom-plot',		
		side:THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
		lights: true,
	});
	// plot mesh
	plotMesh = new THREE.Mesh(bufferGeometry, material);	
	scene.add(plotMesh);
//	var wireframeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, wireframe:true});
//	var wireframeGeometry = new THREE.EdgesGeometry(geometry);
//	plotWireframe = new THREE.Mesh(geometry, wireframeMaterial);
	// tube
	var tubeGeometry = new THREE.Geometry();
	var tubeMaterial = new THREE.MeshLambertMaterial({
		color:0x00eeee, 
		side:THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
		depthTest: true,
	});
	var numAngles = 16;
	var angle;
	var radius = 0.1;
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
			vector = new THREE.Vector3(x*scale.x, y*scale.y+radius*cos[ia], radius*sin[ia]);
			tubeGeometry.vertices.push(vector);
		}
	}
	var n = tubeGeometry.vertices.length;
	for(var ia = 1; ia < numAngles-1; ia++){
		tubeGeometry.faces.push(new THREE.Face3(0, ia, ia+1));
		tubeGeometry.faces.push(new THREE.Face3(n-1, n-1-ia, n-2-ia));
	}
	var off = 0;
	var iam = numAngles-1;
	for(var ix = 0; ix < numSteps.x-1; ix++){
		for(var ia = 0; ia < numAngles; ia++){
			var i1 = off;
			var i2 = off+1;
			if(iam == ia) i2 -= numAngles;
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
	b: Complex.create(1.0, 0),
	c: Complex.create(1.0, 0),
	f1: Complex.create(0,0),
	f2: Complex.create(0,0),
	f3: Complex.create(0,0),
	f4: Complex.create(0,0),
	f5: Complex.create(0,0),
	f6: Complex.create(0,0),
	f7: Complex.create(0,0),
	f8: Complex.create(0,0),
	f9: Complex.create(0,0),
};
function f(out, complex){
	// y=a*x^2
//	Complex.set(out, complex.r, complex.i); // out=z
//	Complex.multiply(out, out, out); // out=z*z
//	Complex.multiply(out, out, z.a); // out=z*z*a
	// y=x
//	Complex.set(out, complex.r, complex.i); // out=z
	// y=sin(x)
	z.f1.set(0.5, 0.0);
	z.f2.set(0.5, 0.0);
	Complex.multiply(z.f2, z.f1, complex);
	Complex.sin(out, z.f2);
	// y=sin(x)*sin(x*0.5)
/*	z.f1.copy(complex); // f1=x
	z.f2.set(0.5, 0); // f2=0.5
	Complex.multiply(z.f3, z.f1, z.f2); // f3=x*0.5
	Complex.sin(z.f3, z.f3); // f3=sin(x*0.5)
	Complex.sin(z.f4, z.f1); // f4=sin(x)
	Complex.multiply(out, z.f3, z.f4); */
	// y=cos(x)
//	Complex.cos(out, complex); // out=cos(z)
//	out.r *= 0.5;
	// return
	return out.r;
}






































