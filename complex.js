function Complex(r, i){
	this.r = r;
	this.i = i;
}
Complex.prototype.set = function(r,i){
	this.r = r;
	this.i = i;
}
Complex.prototype.copy = function(z){
	this.r = z.r;
	this.i = z.i;
}
Complex.create = function(r, i){
	return new Complex(r === undefined ? 0 : r, i === undefined ? 0 : i);
}
Complex.set = function(out, r, i){
	out.r = r;
	out.i = i;
	return out;	
}
Complex.add = function(out, z1, z2){
	out.r = z1.r + z2.r;
	out.i = z1.i + z2.i;
	return out;	
}
Complex.subtract = function(out, z1, z2){
	out.r = z1.r - z2.r;
	out.i = z1.i - z2.i;
	return out;	
}
Complex.multiply = function(out, z1, z2){
	var r = z1.r*z2.r-z1.i*z2.i;
	var i = z1.r*z2.i+z1.i*z2.r;
	out.r = r;
	out.i = i;
	return out;	
}
Complex.divide = function(out, z1, z2){	
	var r = z1.r*z2.r-z1.i*z2.i;
	var i = z1.r*z2.i+z1.i*z2.r;
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
