function Complex(r, i){
	this.r = r;
	this.i = i;
}
Complex.create = function(r, i){
	return new Complex(r === undefined ? 0 : r, i === undefined ? 0 : i);
}
Complex.set = function(out, r, i){
	out.r = r;
	out.i = i;
	return out;	
}
Complex.add = function(out, z){
	out.r += z.r;
	out.i += z.i;
	return out;	
}
Complex.subtract = function(out, z){
	out.r -= z.r;
	out.i -= z.i;
	return out;	
}
Complex.multiply = function(out, z){
	var r = out.r*z.r-out.i*z.i;
	var i = out.r*z.i+out.i*z.r;
	out.r = r;
	out.i = i;
	return out;	
}
Complex.divide = function(out, z){	
	var r = out.r*z.r-out.i*z.i;
	var i = out.r*z.i+out.i*z.r;
	out.r = r;
	out.i = i;
	return out;	
}
Complex.sin = function(out, z){
	var r = Math.sin(z.r)*Math.cosh(z.i);
	var i = Math.cos(z.r)*Math.sinh(z.i);
	out.r = r;
	out.i = i;
	return out;
}
Complex.cos = function(out, z){
	var r = Math.cos(z.r)*Math.cosh(z.i);
	var i = Math.sin(z.r)*Math.sinh(z.i);
	out.r = r;
	out.i = i;
	return out;
}
