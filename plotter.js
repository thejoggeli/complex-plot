function Grid(){}
Grid.items = [];
Grid.scale = new THREE.Vector3(1,1,1);
Grid.build = function(){
	for(var x in Grid.items){
		scene.remove(Grid.items[x]);
	}	
	Grid.items = [];
	// grid
	var geometry = new THREE.CylinderGeometry(0.05, 0.05, 1000, 8, 1);
	var material = new THREE.MeshLambertMaterial({color:0xcccccc});
	var axis;
	// y-axis
	axis = new THREE.Mesh(geometry, material);
	scene.add(axis);
	Grid.items.push(axis);
	// x-axis
	axis = new THREE.Mesh(geometry, material);
	axis.rotation.z = Math.PI/2;
	scene.add(axis);
	Grid.items.push(axis);
	// z-axis
	axis = new THREE.Mesh(geometry, material);
	axis.rotation.x = Math.PI/2;
	scene.add(axis);
	Grid.items.push(axis);
	
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
			axis.position.set(vector.x*i*Grid.scale.x, vector.y*i*Grid.scale.y, vector.z*i*Grid.scale.z);
			scene.add(axis);
			Grid.items.push(axis);
			if(v == 1){
				axis.rotation.x = Math.PI/2;
				axis.rotation.z = -Math.PI/2;
				axis.position.x -= 0.06;
			} else {
				axis.position.y -= 0.06;
			}
		}
	}	
}

function MiniGrid(){}
MiniGrid.mesh;
MiniGrid.scene;
MiniGrid.camera;
MiniGrid.init = function(){	
	// scene
	MiniGrid.scene = new THREE.Scene();
	
	// camera
	MiniGrid.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 1000);
	MiniGrid.camera.position.set(0,0,50);
	MiniGrid.camera.lookAt(new THREE.Vector3(0,0,0));
	
	// light
    var ambientLight = new THREE.AmbientLight(0xFFFFFF);
    ambientLight.intensity = 0.35;
    MiniGrid.scene.add(ambientLight);
    
	var directionalLight = new THREE.DirectionalLight(0xFFFFFF);
	directionalLight.position.set(0, 20, 20);
	directionalLight.intensity = 1;
	MiniGrid.scene.add(directionalLight); 
	
	// grid
	var group = new THREE.Group();
	group.add(MiniGrid.buildArrow(new THREE.Vector3(1,0,0), new THREE.Vector3(0,0,1), 0xFF0000));
	group.add(MiniGrid.buildArrow(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,2), 0x00FF00));
	group.add(MiniGrid.buildArrow(new THREE.Vector3(0,0,1), new THREE.Vector3(-1,0,0), 0x0000FF));
	var scale = 0.4;
	group.scale.set(scale, scale, scale);
	MiniGrid.mesh = group;
	MiniGrid.scene.add(MiniGrid.mesh);
}
MiniGrid.buildArrow = function(position, rotation, color){	
	var length = 2;
	var geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 8, 1);
	var material = new THREE.MeshLambertMaterial({color:color});
	var group = new THREE.Group();
	var axis;
	// cone
	axis = new THREE.Mesh(geometry, material);
	axis.position.x = position.x*length/2;
	axis.position.y = position.y*length/2;
	axis.position.z = position.z*length/2;
	axis.rotation.x = rotation.x * Math.PI/2;
	axis.rotation.y = rotation.y * Math.PI/2;
	axis.rotation.z = rotation.z * Math.PI/2;
	group.add(axis);
	// cone
	var length2 = 0.5;
	geometry = new THREE.CylinderGeometry(0.2, 0, length2, 8, 1);
	axis = new THREE.Mesh(geometry, material);
	axis.position.x = position.x*length2/2 + position.x*length;
	axis.position.y = position.y*length2/2 + position.y*length;
	axis.position.z = position.z*length2/2 + position.z*length;
	axis.rotation.x = rotation.x * Math.PI/2;
	axis.rotation.y = rotation.y * Math.PI/2;
	axis.rotation.z = rotation.z * Math.PI/2;
	group.add(axis);
	return group;
}
MiniGrid.update = function(){
/*	MiniGrid.mesh.rotation.x = camera.rotation.x;
	MiniGrid.mesh.rotation.y = camera.rotation.y;
	MiniGrid.mesh.rotation.z = camera.rotation.z; */
	MiniGrid.mesh.quaternion.copy(camera.quaternion);
	MiniGrid.mesh.quaternion.inverse();
}
MiniGrid.render = function(){
	var size = window.innerHeight/3;
	renderer.setViewport(0, 0, size, size);
	renderer.render(MiniGrid.scene, MiniGrid.camera);
}
MiniGrid.resize = function(){
/*	MiniGrid.camera.aspect = 1;
	MiniGrid.camera.far = 5000;
	MiniGrid.camera.near = 0.1;
	MiniGrid.camera.fov = 90;
	MiniGrid.camera.updateProjectionMatrix(); */
}

function Cursor(){}
Cursor.raycaster = new THREE.Raycaster();
Cursor.mouse = new THREE.Vector2();
Cursor.mesh = null;
Cursor.lookAtPosition = new THREE.Vector3();
Cursor.planes = {
	xy: null,
	xz: null,
	yz:null,
};
Cursor.$valueDisplay;
Cursor.linesNode;
Cursor.planesNode;
Cursor.lines = [];
Cursor.planes = [];
Cursor.frozen = false;
Cursor.meshMaterial;
Cursor.lineMaterial1;
Cursor.lineMaterial2;
Cursor.planeMaterial;
Cursor.init = function(){	$
	Cursor.$valueDisplay = $("#value-display");
	var group = new THREE.Group();
	var length = 1;
	var arrlength = 0.5;
	var geometry = new THREE.CylinderGeometry(0.25, 0.025, length, 8, 1);
	var geometry2 = new THREE.CylinderGeometry(0.125, 0.125, arrlength, 24, 1);
	var material = Cursor.meshMaterial = new THREE.MeshLambertMaterial({color:0x00FFFF});
	var axis;
	// cone
	// z-axis
/*	var arrow1 = axis = new THREE.Mesh(geometry, material);
	axis.position.z = -length/2;
	axis.rotation.x = -Math.PI/2;
	group.add(axis);
	axis = new THREE.Mesh(geometry2, material);
	axis.position.y = arrlength/2 + length/2;
	arrow1.add(axis);
	var arrow2 = axis = new THREE.Mesh(geometry, material);
	axis.position.z = arrlength/2 + length/2;
	axis.rotation.x = Math.PI/2;
	group.add(axis); 
	axis = new THREE.Mesh(geometry2, material);
	axis.position.y = arrlength;
	arrow2.add(axis); */
	var arrow1 = axis = new THREE.Mesh(geometry2, material);
	axis.rotation.x = -Math.PI/2;
	axis.scale.y = 0.01;
	axis.scale.x = axis.scale.z = 0.1;
//		axis.scale.z = 0.5;
	group.add(axis);
	// x-axis
/*	axis = new THREE.Mesh(geometry, material);
	axis.position.x = length/2;
	axis.rotation.z = -Math.PI/2;
	group.add(axis);
	axis = new THREE.Mesh(geometry, material);
	axis.position.x = -length/2;
	axis.rotation.z = Math.PI/2;
	group.add(axis);
	// y-axis
	axis = new THREE.Mesh(geometry, material);
	axis.position.y = length/2;
	group.add(axis);
	axis = new THREE.Mesh(geometry, material);
	axis.position.y = -length/2;
	axis.rotation.x = -Math.PI;
	group.add(axis); */
	Cursor.mesh = group;
	
	var linesDirs = [
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, 0, 1),
		new THREE.Vector3(1, 0, 0),
		new THREE.Vector3(0, 1, 0),
		new THREE.Vector3(0, 0, 1),
	];
	var linesNode = new THREE.Group();
	var lineMaterial = Cursor.lineMaterial1 = new THREE.LineBasicMaterial({color: 0x00ffff});
	var lineMaterial2  = Cursor.lineMaterial2 = new THREE.LineBasicMaterial({color: 0x00ffff});
	for(var i = 0; i < linesDirs.length; i++){
		var lineGeometry = new THREE.Geometry();
		lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
		lineGeometry.vertices.push(linesDirs[i]);
		var line = new THREE.Line(lineGeometry, i < 3 ? lineMaterial : lineMaterial2);
	//	if(i == 1 || i == 4 | i == 7 || i == 2 | i == 0) linesNode.add(line);
		if(i == 1 || i == 3 || i == 8) linesNode.add(line);
	//	linesNode.add(line);
		Cursor.lines[i] = line;
	}
	var planesNode = new THREE.Group();
	var planeMaterial = Cursor.planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, side:THREE.DoubleSide});
	for(var i = 0; i < 3; i++){
		var planeGeometry = new THREE.PlaneGeometry(1,1);
		var plane = new THREE.Mesh(planeGeometry, planeMaterial);
		Cursor.planes[i] = plane;
		if(false) planesNode.add(plane);
	}
	Cursor.planes[0].rotation.y = Math.PI/2;
	Cursor.planes[1].rotation.x = Math.PI/2;
	Cursor.linesNode = linesNode;
	Cursor.planesNode = planesNode;
}
Cursor.unfreeze = function(){
	if(!Cursor.frozen) return;
	Cursor.frozen = false;
	var color = 0x00FFFF;
	Cursor.meshMaterial.color.setHex(color);
//	Cursor.lineMaterial1.color.setHex(color);
//	Cursor.lineMaterial2.color.setHex(color);
}
Cursor.freeze = function(){
	if(Cursor.frozen) return;
	Cursor.frozen = true;
	var color = 0xFF00FF;
	Cursor.meshMaterial.color.setHex(0xFFFFFF);
//	Cursor.lineMaterial1.color.setHex(color);
//	Cursor.lineMaterial2.color.setHex(color);
	var scale = 2.5;
	Cursor.mesh.scale.x = scale;
	Cursor.mesh.scale.y = scale;
	Cursor.mesh.scale.z = scale;
}
Cursor.downPoint = new THREE.Vector3();
Cursor.downPosition = {x:0, y:0};
Cursor.update = function(){
	if(Cursor.frozen){
		if(Input.mouseDown()){
			Cursor.mouse.x = Input.mouse.screenPosition.x / window.innerWidth*2 - 1;
			Cursor.mouse.y = -Input.mouse.screenPosition.y / window.innerHeight*2 + 1;
			Cursor.downPosition.x = Cursor.mouse.x;
			Cursor.downPosition.y = Cursor.mouse.y;
		}
		if(Input.mouseUp()){
			Cursor.mouse.x = Input.mouse.screenPosition.x / window.innerWidth*2 - 1;
			Cursor.mouse.y = -Input.mouse.screenPosition.y / window.innerHeight*2 + 1;
			if(Cursor.downPosition.x == Cursor.mouse.x && Cursor.downPosition.y == Cursor.mouse.y){
			/*	var camera = getCamera();
				Cursor.raycaster.setFromCamera(Cursor.mouse, camera);
				var intersects = Cursor.raycaster.intersectObjects(Plotter.raycastTargets);
				if(intersects.length > 0){
					Cursor.unfreeze();	
				} */				
				Cursor.unfreeze();	
			}
		}
	} else if(!Cursor.frozen){			
		Cursor.mouse.x = Input.mouse.screenPosition.x / window.innerWidth*2 - 1;
		Cursor.mouse.y = -Input.mouse.screenPosition.y / window.innerHeight*2 + 1;
		var camera = getCamera();
		Cursor.raycaster.setFromCamera(Cursor.mouse, camera);
		var intersects = Cursor.raycaster.intersectObjects(Plotter.raycastTargets);
		if(intersects.length > 0){
			var point = intersects[0].point;
			if(Cursor.mesh.parent !== scene){
		//		scene.add(Cursor.mesh);
				Cursor.$valueDisplay.show();
			}
			if(Cursor.linesNode.parent !== scene){
		//		scene.add(Cursor.linesNode);
			}
			if(Cursor.planesNode.parent !== scene){
		//		scene.add(Cursor.planesNode);
			}
			Cursor.mesh.position.x = point.x;
			Cursor.mesh.position.y = point.y;
			Cursor.mesh.position.z = point.z;
			var distance = intersects[0].distance;
			var scale = cameraMode == "ortho" ? 1/camera.zoom : distance*0.1;
			var normal = intersects[0].face.normal;
			Cursor.lookAtPosition.x = point.x + normal.x;
			Cursor.lookAtPosition.y = point.y + normal.y;
			Cursor.lookAtPosition.z = point.z + normal.z; 
			Cursor.mesh.lookAt(Cursor.lookAtPosition); 
			Cursor.mesh.scale.x = scale;
			Cursor.mesh.scale.y = scale; 
			Cursor.mesh.scale.z = scale; 
			Cursor.linesNode.position.copy(point);
			Cursor.lines[0].scale.x = -point.x;
			Cursor.lines[1].scale.y = -point.y;
			Cursor.lines[2].scale.z = -point.z;
			Cursor.lines[3].scale.x = -point.x;
			Cursor.lines[3].position.y = -point.y;
			Cursor.lines[4].scale.y = -point.y;
			Cursor.lines[4].position.x = -point.x;
			Cursor.lines[5].scale.z = -point.z;
			Cursor.lines[5].position.x = -point.x;
			Cursor.lines[6].scale.x = -point.x;
			Cursor.lines[6].position.z = -point.z;
			Cursor.lines[7].scale.y = -point.y;
			Cursor.lines[7].position.z = -point.z;
			Cursor.lines[8].scale.z = -point.z;
			Cursor.lines[8].position.y = -point.y;
			Cursor.planes[0].scale.x = point.z;
			Cursor.planes[0].scale.y = point.y;
			Cursor.planes[0].position.set(point.x, point.y/2, point.z/2);
			Cursor.planes[1].scale.x = point.x;
			Cursor.planes[1].scale.y = point.z;
			Cursor.planes[1].position.set(point.x/2, 0, point.z/2);
			Cursor.planes[2].scale.x = point.x;
			Cursor.planes[2].scale.y = point.y;
			Cursor.planes[2].position.set(point.x/2, point.y/2, point.z);
			var coord = new THREE.Vector3(point.x / Grid.scale.x, point.y / Grid.scale.y, point.z / Grid.scale.z);
			var inputStr = "";
			var outputStr = "";
			if(Plotter.mode == "complex"){
				inputStr = "f(" + roundToFixed(coord.x, 3) + " + " + roundToFixed(coord.z, 3) + "i)";
				var ov1;
				var ov2;
				if(Plotter.flipComplex){
					ov1 = Plotter.getColorValue(coord.x, coord.z);
					ov2 = coord.y;
				} else {	
					ov1 = coord.y;
					ov2 = Plotter.getColorValue(coord.x, coord.z); 
				}
				if(ov2 >= 0){
					outputStr = roundToFixed(ov1, 3) + " + " + roundToFixed(ov2, 3) + "i";				
				} else {
					outputStr = roundToFixed(ov1, 3) + " - " + Math.abs(roundToFixed(ov2, 3)) + "i";				
				}
			} else {
				inputStr = "f(" + roundToFixed(coord.x, 3) + ", " + roundToFixed(coord.z, 3) + ")";
				outputStr = roundToFixed(coord.y, 3);
			}
			Cursor.$valueDisplay.find(".input").text(inputStr);
			Cursor.$valueDisplay.find(".output").text(outputStr);
			if(Input.mouseDown()){
				Cursor.downPoint.copy(point);
			}
			if(Input.mouseUp() && point.equals(Cursor.downPoint)){
			//	Cursor.freeze();
			}
		} else {
			if(Cursor.$valueDisplay.is(":visible")){
				Cursor.$valueDisplay.hide();
			}
			if(Cursor.mesh.parent === scene){
				scene.remove(Cursor.mesh);
				Cursor.$valueDisplay.hide();
			}
			if(Cursor.linesNode.parent === scene){
				scene.remove(Cursor.linesNode);
			}
			if(Cursor.planesNode.parent === scene){
				scene.remove(Cursor.planesNode);
			}
		}
	}
}

function Plotter(){}
Plotter.mode = "complex";
Plotter.flipComplex = false;
Plotter.resultIsComplex = false;
Plotter.lineWidth;
Plotter.expression = "sin(z)";
Plotter.areaMesh = null;
Plotter.lineMesh = null;
Plotter.areaWireframe = null;
Plotter.lineWireframe = null;
Plotter.showAreaWireframe = false;
Plotter.showLineWireframe = false;
Plotter.showLine = false;
Plotter.showArea = false;
Plotter.areaResults;
Plotter.lineResults;
Plotter.bounds = {
	min_z: -1.0, max_z: 0.0,
	min_x: -25.0, max_x: 25.0,
};
Plotter.quadSize = {x: 0.1, z: 0.1};
Plotter.raycastTargets = [];
Plotter.getColorValue = function(x, z){	
	var result = Plotter.expression.eval({x:x, z:z});
	if(result.re !== undefined){
		return Plotter.flipComplex ? result.re : result.im;
	} else {
		return 0;
	}
}
Plotter.plot = function(expression){
	try {
		Plotter.expression = expression;	
		if(Plotter.areaMesh != null) scene.remove(Plotter.areaMesh); 
		if(Plotter.lineMesh != null) scene.remove(Plotter.lineMesh);
		if(Plotter.areaWireframe != null) scene.remove(Plotter.areaWireframe); 
		if(Plotter.showLineWireframe != null) scene.remove(Plotter.lineWireframe);
		Plotter.areaMesh = null;
		Plotter.lineMesh = null;	
		Plotter.areaWireframe = null;
		Plotter.lineWireframe = null;
		Plotter.areaResults = [];
		Plotter.lineResults = [];
		
		Cursor.unfreeze();
		
		// num steps
		var numSteps = {};
		numSteps.x = (Plotter.bounds.max_x-Plotter.bounds.min_x)/Plotter.quadSize.x+1;
		numSteps.z = (Plotter.bounds.max_z-Plotter.bounds.min_z)/Plotter.quadSize.z+1;
		
		// offset
		var offset = Plotter.offset = {};
		offset.x = Plotter.bounds.min_x;
		offset.z = Plotter.bounds.min_z;
		Plotter.precalc(numSteps);
		if(Plotter.mode == "real" && Plotter.resultIsComplex){
			return false;
		} 
		Plotter.plotArea(numSteps);		
		Plotter.plotLine(numSteps);	
		Plotter.applyLineColor();
		Plotter.applyAreaColor();
		Plotter.applyAreaOpacity();
		Plotter.updateRaycastTargets();
	} catch(e){
		console.error(e);
		return false;
	}
	return true;
}

Plotter.setLineColor = function(hue){
	Plotter.lineColor = hue;
	Plotter.applyLineColor();
}
Plotter.applyLineColor = function(){
	if(Plotter.lineMesh !== null){
		Plotter.lineMesh.material.color.setHex(Colors.hslToHexInt(Plotter.lineColor, 1, 0.45));
	}
}
Plotter.setAreaColor = function(hue){
	Plotter.areaColor = hue;
	Plotter.applyAreaColor();
}
Plotter.applyAreaColor = function(){
	if(Plotter.areaMesh !== null){
		Plotter.areaMesh.material.uniforms.hue_offset.value = Plotter.areaColor;
	}
}
Plotter.setAreaOpacity = function(opacity){
	Plotter.areaOpacity = opacity;
	Plotter.applyAreaOpacity();
}
Plotter.applyAreaOpacity = function(){
	if(Plotter.areaMesh !== null){
		Plotter.areaMesh.material.uniforms.area_opacity.value = Plotter.areaOpacity;;
	}
}
Plotter.updateRaycastTargets = function(){
	Plotter.raycastTargets = [];
	if(Plotter.showArea){
		Plotter.raycastTargets.push(Plotter.areaMesh);
	} else if(Plotter.showLine){
	//	Plotter.raycastTargets.push(Plotter.lineMesh);		
	}
}

Plotter.setShowLineWireframe = function(v){
	if(v == Plotter.showLineWireframe) return;
	Plotter.showLineWireframe = v;
	if(Plotter.showLineWireframe & Plotter.lineWireframe != null){
		scene.add(Plotter.lineWireframe);
	} else if(!Plotter.showLineWireframe & Plotter.lineWireframe != null){
		scene.remove(Plotter.lineWireframe);		
	}
	Plotter.updateRaycastTargets();
}
Plotter.setShowAreaWireframe = function(v){
	if(v == Plotter.showAreaWireframe) return;
	Plotter.showAreaWireframe = v;
	if(Plotter.showAreaWireframe & Plotter.areaWireframe != null){
		scene.add(Plotter.areaWireframe);
	} else if(!Plotter.showAreaWireframe & Plotter.areaWireframe != null){
		scene.remove(Plotter.areaWireframe);		
	}	
	Plotter.updateRaycastTargets();
}
Plotter.setShowLine = function(v){
	if(v == Plotter.showLine) return;
	Plotter.showLine = v;
	if(Plotter.showLine & Plotter.lineMesh != null){
		scene.add(Plotter.lineMesh);
	} else if(!Plotter.showLine & Plotter.lineMesh != null){
		scene.remove(Plotter.lineMesh);		
	}	
	Plotter.updateRaycastTargets();
}
Plotter.setShowArea = function(v){
	if(v == Plotter.showArea) return;
	Plotter.showArea = v;
	if(Plotter.showArea & Plotter.areaMesh != null){
		scene.add(Plotter.areaMesh);
	} else if(!Plotter.showArea & Plotter.areaMesh != null){
		scene.remove(Plotter.areaMesh);		
	}
	Plotter.updateRaycastTargets();
}
Plotter.setMode = function(mode){
	Plotter.mode = mode;	
}

Plotter.precalc = function(numSteps){
	var offset = Plotter.offset;
	Plotter.resultIsComplex = false;
	Plotter.hasZ = false;
	var ex = Plotter.expression;
	ex = ex.toLowerCase();
	if(Plotter.mode == "real"){
		// nothing
	} else {
		ex = ex.replace(/cos/g, "COS");
		ex = ex.replace(/c/g, "(x+z)");
		ex = ex.replace(/z/g, "z*i");
	}
	ex = ex.toLowerCase();
	var expr = Plotter.expression = math.compile(ex);
	var x, z, res;
	for(var ix = 0; ix < numSteps.x; ix++){
		Plotter.areaResults[ix] = [];
		for(var iz = 0; iz < numSteps.z; iz++){
			x = ix * Plotter.quadSize.x + offset.x;
			z = iz * Plotter.quadSize.z + offset.z;
			Plotter.areaResults[ix][iz] = expr.eval({x:x, z:z});
			if(Plotter.areaResults[ix][iz].re !== undefined){
				Plotter.resultIsComplex = true;
			} else {
				Plotter.areaResults[ix][iz] = {re: Plotter.areaResults[ix][iz], im: 0};
			}
		}
	}	
	for(var ix = 0; ix < numSteps.x; ix++){
		x = ix * Plotter.quadSize.x + offset.x;
		Plotter.lineResults[ix] = expr.eval({x:x, z:0});
		if(Plotter.lineResults[ix].re !== undefined){
			Plotter.resultIsComplex = true;
		} else {
			Plotter.lineResults[ix] = {re: Plotter.lineResults[ix], im: 0};
		} 
	}
	if(Plotter.flipComplex && Plotter.mode == "complex"){
		var tmp;
		for(var ix = 0; ix < numSteps.x; ix++){
			for(var iz = 0; iz < numSteps.z; iz++){
				tmp = Plotter.areaResults[ix][iz].re;
				Plotter.areaResults[ix][iz].re =  Plotter.areaResults[ix][iz].im;
				Plotter.areaResults[ix][iz].im = tmp;
			}
		}	
		for(var ix = 0; ix < numSteps.x; ix++){
			tmp = Plotter.lineResults[ix].re;
			Plotter.lineResults[ix].re =  Plotter.lineResults[ix].im;
			Plotter.lineResults[ix].im = tmp;
		}
	}
}

Plotter.plotArea = function(numSteps){
	var offset = Plotter.offset;
	var scale = Grid.scale;	
	// plot
	var vector_index = 0;
	var x, y, z, vector;
	var result;
	var imaginaries = [];
	var vertices = [];
	var colors = [];
	var normals = [];
	var indices = [];
	var max_y, min_y, max_i, min_i;
	if(Plotter.mode == "real"){
		max_y = -Infinity;
		min_y = Infinity;
		for(var ix = 0; ix < numSteps.x; ix++){
			for(var iz = 0; iz < numSteps.z; iz++){
				// xz
				x = ix * Plotter.quadSize.x + offset.x;
				z = iz * Plotter.quadSize.z + offset.z;			
				// real
				y = Plotter.areaResults[ix][iz].re;
				if(y > max_y) max_y = y;
				if(y < min_y) min_y = y;
				// vertices, colors, normals
				vertices.push(x*scale.x, y*scale.y, z*scale.z);
				colors.push(1.0, 0.0, 0.0);
				normals.push(0,0,0);	
				// faces
				if(ix > 0 && iz > 0){
					indices.push(vector_index, vector_index-numSteps.z, vector_index-numSteps.z-1);
					indices.push(vector_index, vector_index-numSteps.z-1, vector_index-1);
				}
				vector_index++;
			}
		}
		min_y *= Grid.scale.y;
		max_y *= Grid.scale.y;
	} else {
		max_i = -Infinity;
		min_i = Infinity;
		var im;
		for(var ix = 0; ix < numSteps.x; ix++){
			for(var iz = 0; iz < numSteps.z; iz++){
				// xz
				x = ix * Plotter.quadSize.x + offset.x;
				z = iz * Plotter.quadSize.z + offset.z;			
				// real
				y = Plotter.areaResults[ix][iz].re;			
				// imaginary 
				im = Plotter.areaResults[ix][iz].im;
				imaginaries.push(im);
				if(im < min_i) min_i = im;
				if(im > max_i) max_i = im;			
				// vertices, colors, normals
				vertices.push(x*scale.x, y*scale.y, z*scale.z);
				colors.push(1.0, 0.0, 0.0);
				normals.push(0,0,0);			
				// faces
				if(ix > 0 && iz > 0){
					indices.push(vector_index, vector_index-numSteps.z, vector_index-numSteps.z-1);
					indices.push(vector_index, vector_index-numSteps.z-1, vector_index-1);
				}
				vector_index++;
			}
		}		
		console.log("i min,max = " + min_i + "," + max_i); 
	}
	// plot geometry
	var bufferGeometry, material;
	if(Plotter.mode == "real"){
		bufferGeometry = new THREE.BufferGeometry();
		// plot material
		var uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.realPlot.uniforms);
		uniforms["diffuse"].value.set(0xFF0000);
		uniforms["min_plot_y"] = {value:min_y};
		uniforms["max_plot_y"] = {value:max_y};
		uniforms["plot_y_range"] = {value:max_y-min_y};
		uniforms["hue_offset"] = {value:Plotter.areaColor};
		uniforms["area_opacity"] = {value:Plotter.areaOpacity};
		material = new THREE.ShaderMaterial({
			defines: {},
			uniforms: uniforms,
			vertexShader: THREE.ShaderLib.realPlot.vertexShader,
			fragmentShader: THREE.ShaderLib.realPlot.fragmentShader,
			name: 'custom-plot',		
			side:THREE.DoubleSide,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1,
			lights: true,
			transparent: true,
		});
	} else {
		bufferGeometry = new THREE.BufferGeometry();
		bufferGeometry.addAttribute('imaginary', new THREE.Float32BufferAttribute(imaginaries, 1));
		// plot material
		var uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.complexPlot.uniforms);
		uniforms["diffuse"].value.set(0xFF0000);
		uniforms["min_plot_i"] = {value:min_i};
		uniforms["max_plot_i"] = {value:max_i};
		uniforms["plot_i_range"] = {value:max_i-min_i};
		uniforms["hue_offset"] = {value:Plotter.areaColor};
		uniforms["area_opacity"] = {value:Plotter.areaOpacity};
		material = new THREE.ShaderMaterial({
			defines: {},
			uniforms: uniforms,
			vertexShader: THREE.ShaderLib.complexPlot.vertexShader,
			fragmentShader: THREE.ShaderLib.complexPlot.fragmentShader,
			name: 'custom-plot',		
			side:THREE.DoubleSide,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1,
			lights: true,
			transparent: true,
		});		
	}
	bufferGeometry.setIndex(indices);
	bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	bufferGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	bufferGeometry.computeVertexNormals();
	bufferGeometry.normalizeNormals();
	// plot mesh
	plotMesh = new THREE.Mesh(bufferGeometry, material);	
	if(Plotter.showArea){
		scene.add(plotMesh);
	}
	Plotter.areaMesh = plotMesh;
	// wireframe
	var wireframeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, wireframe:true});
	var wireframe = new THREE.Mesh(bufferGeometry, wireframeMaterial);
	if(Plotter.showAreaWireframe){		
		scene.add(wireframe);
	}
	Plotter.areaWireframe = wireframe;
}

Plotter.plotLine = function(numSteps){	
	var offset = Plotter.offset;
	var scale = Grid.scale;	
	// tube
	var tubeGeometry = new THREE.Geometry();
	var tubeMaterial = new THREE.MeshLambertMaterial({
		color: 0xFF0000,
		side:THREE.DoubleSide,
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
		depthTest: true,
	});
	var numAngles = 16;
	var angle;
	var radius = Plotter.lineWidth/2;
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
		x = ix * Plotter.quadSize.x + offset.x;
		result = Plotter.lineResults[ix];
		y = result.re;
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
	if(Plotter.showLine){
		scene.add(tubeMesh);
	}
	Plotter.lineMesh = tubeMesh;
	// wireframe
	var wireframeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, wireframe:true});
	var wireframe = new THREE.Mesh(tubeGeometry, wireframeMaterial);
	if(Plotter.showLineWireframe){
		scene.add(wireframe);
	}
	Plotter.lineWireframe = wireframe;
}
