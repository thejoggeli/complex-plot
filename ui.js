function Ui(){}
Ui.init = function(){
	$(".plot-it").on("click", function(){
		Ui.beginPlot();
	});
	$("#ui-1 input[type=text]").on("keydown", function(e){
		if(e.keyCode == 13){
			Ui.beginPlot();
		}
	});
	Ui.applyValues();
	$("#ui-1 .minimize").on("click", function(){
		$("#ui-1 .maximize").show();
		$("#ui-1 .minimize").hide();
		$("#ui-1 .category").hide();
	});
	$("#ui-1 .maximize").on("click", function(){
		$("#ui-1 .maximize").hide();
		$("#ui-1 .minimize").show();
		$("#ui-1 .category").show();		
	});
	$(".line-wireframe").on("click", function(){
		$(this).toggleClass("active");
		Plotter.setShowLineWireframe($(this).hasClass("active"));
	});
	$(".area-wireframe").on("click", function(){
		$(this).toggleClass("active");
		Plotter.setShowAreaWireframe($(this).hasClass("active"));
	});
}

Ui.applyValues = function(){
	Plotter.bounds.min_x = parseFloat($("input.min-x").val());
	Plotter.bounds.max_x = parseFloat($("input.max-x").val());
	Plotter.bounds.min_z = parseFloat($("input.min-z").val());
	Plotter.bounds.max_z = parseFloat($("input.max-z").val());
	Grid.scale.x = parseFloat($("input.x-scale").val());
	Grid.scale.y = parseFloat($("input.y-scale").val());
	Grid.scale.z = parseFloat($("input.z-scale").val());
	var f = parseFloat($("input.quad-size").val());
	Plotter.quadSize.x = Plotter.quadSize.z = f;	
	Plotter.setShowLineWireframe($(".line-wireframe").hasClass("active"));
	Plotter.setShowAreaWireframe($(".area-wireframe").hasClass("active"));
}


Ui.beginPlot = function(){	
	Ui.applyValues();
	var expression = $(".expression-input").val();
	Grid.build();
	if(!Plotter.plot(expression)){
		alert("invalid expression: " + expression);
	}	
}
