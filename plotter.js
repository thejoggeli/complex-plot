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

function Plotter(){}
Plotter.expression = "sin(z)";
Plotter.areaMesh = null;
Plotter.lineMesh = null;
Plotter.areaWireframe = null;
Plotter.lineWireframe = null;
Plotter.showAreaWireframe = false;
Plotter.showLineWireframe = false;
Plotter.areaResults;
Plotter.lineResults;
Plotter.bounds = {
	min_z: -1.0, max_z: 0.0,
	min_x: -25.0, max_x: 25.0,
};
Plotter.quadSize = {x: 0.1, z: 0.1};
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
				
		// num steps
		var numSteps = {};
		numSteps.x = (Plotter.bounds.max_x-Plotter.bounds.min_x)/Plotter.quadSize.x+1;
		numSteps.z = (Plotter.bounds.max_z-Plotter.bounds.min_z)/Plotter.quadSize.z+1;	
		// offset
		var offset = {};
		offset.x = Plotter.bounds.min_x;
		offset.z = Plotter.bounds.min_z;
		var isComplex = Plotter.precalc(numSteps, offset);
		console.log("isComplex: " + isComplex);
		if(isComplex) Plotter.plotArea(numSteps, offset);
		Plotter.plotLine(numSteps, offset);
	} catch(e){
		console.log(e);
		return false;
	}
	return true;
}

Plotter.setShowLineWireframe = function(v){
	if(v == Plotter.showLineWireframe) return;
	Plotter.showLineWireframe = v;
	if(Plotter.showLineWireframe & Plotter.lineWireframe != null){
		scene.add(Plotter.lineWireframe);
	} else if(!Plotter.showLineWireframe & Plotter.lineWireframe != null){
		scene.remove(Plotter.lineWireframe);		
	}
}
Plotter.setShowAreaWireframe = function(v){
	if(v == Plotter.showAreaWireframe) return;
	Plotter.showAreaWireframe = v;
	if(Plotter.showAreaWireframe & Plotter.areaWireframe != null){
		scene.add(Plotter.areaWireframe);
	} else if(!Plotter.showAreaWireframe & Plotter.areaWireframe != null){
		scene.remove(Plotter.areaWireframe);		
	}	
}

Plotter.precalc = function(numSteps, offset){
	var isComplex = false;
	var ex = Plotter.expression;
	ex = ex.replace(/cos/g, "COS");
	ex = ex.replace(/c/g, "(x+z)");
	ex = ex.replace(/z/g, "z*i");
	ex = ex.toLowerCase();
	const expr = math.compile(ex);
	var x, z, res;
	for(var ix = 0; ix < numSteps.x; ix++){
		Plotter.areaResults[ix] = [];
		for(var iz = 0; iz < numSteps.z; iz++){
			x = ix * Plotter.quadSize.x + offset.x;
			z = iz * Plotter.quadSize.z + offset.z;
			Plotter.areaResults[ix][iz] = expr.eval({x:x, z:z});
			if(Plotter.areaResults[ix][iz].re !== undefined){
				isComplex = true;
			} else {
				Plotter.areaResults[ix][iz] = {re: Plotter.areaResults[ix][iz], im: 0};
			}
		}
	}	
	for(var ix = 0; ix < numSteps.x; ix++){
		x = ix * Plotter.quadSize.x + offset.x;
		Plotter.lineResults[ix] = expr.eval({x:x, z:0});
		if(Plotter.lineResults[ix].re !== undefined){
			isComplex = true;
		} else {
			Plotter.lineResults[ix] = {re: Plotter.lineResults[ix], im: 0};
		} 
	}
	return isComplex;
}

Plotter.plotArea = function(numSteps, offset){
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
	var max_i = -Infinity;
	var min_i = Infinity;
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
	// plot geometry
	var bufferGeometry = new THREE.BufferGeometry();
	bufferGeometry.setIndex(indices);
	bufferGeometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	bufferGeometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
	bufferGeometry.addAttribute('imaginary', new THREE.Float32BufferAttribute(imaginaries, 1));
	console.log("i min,max = " + min_i + "," + max_i); 
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
	Plotter.areaMesh = plotMesh;
	// wireframe
	var wireframeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, wireframe:true});
	var wireframe = new THREE.Mesh(bufferGeometry, wireframeMaterial);
	if(Plotter.showAreaWireframe){		
		scene.add(wireframe);
	}
	Plotter.areaWireframe = wireframe;
}

Plotter.plotLine = function(numSteps, offset){	
	var scale = Grid.scale;	
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
	scene.add(tubeMesh);
	Plotter.lineMesh = tubeMesh;
	// wireframe
	var wireframeMaterial = new THREE.MeshBasicMaterial({color:0xFFFFFF, side:THREE.DoubleSide, wireframe:true});
	var wireframe = new THREE.Mesh(tubeGeometry, wireframeMaterial);
	if(Plotter.showLineWireframe){
		scene.add(wireframe);
	}
	Plotter.lineWireframe = wireframe;
}

