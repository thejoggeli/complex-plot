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
		Ui.toCookie();
	});
	$(".area-wireframe").on("click", function(){
		$(this).toggleClass("active");
		Plotter.setShowAreaWireframe($(this).hasClass("active"));
		Ui.toCookie();
	});
	$(".show-line").on("click", function(){
		$(this).toggleClass("active");
		Plotter.setShowLine($(this).hasClass("active"));
		Ui.toCookie();
	});
	$(".show-area").on("click", function(){
		$(this).toggleClass("active");
		Plotter.setShowArea($(this).hasClass("active"));
		Ui.toCookie();
	});
	$(".plot-real").on("click", function(){
		$(".plot-real").addClass("active");
		$(".plot-complex").removeClass("active");
		$(".real").show();
		$(".complex").hide();
	});
	$(".plot-complex").on("click", function(){
		$(".plot-complex").addClass("active");
		$(".plot-real").removeClass("active");
		$(".real").hide();
		$(".complex").show();
	});
	Ui.fromCookie();
}

Ui.updateValues = function(){
	if(Plotter.mode == "real"){
		$(".plot-real").trigger("click");		
	} else {
		$(".plot-complex").trigger("click");				
	}
	$(".line-width").val(Plotter.lineWidth);
	$(".line-min-x").val(Plotter.bounds.min_x);
	$(".line-max-x").val(Plotter.bounds.max_x);
	$(".line-min-z").val(Plotter.bounds.min_z);
	$(".line-max-z").val(Plotter.bounds.max_z);
	$(".input.x-scale").val(Grid.scale.x);
	$(".input.y-scale").val(Grid.scale.y);
	$(".input.z-scale").val(Grid.scale.z);
	$(".input.quad-size").val(Plotter.quadSize.x);
	if(Plotter.showLineWireframe){
		$(".line-wireframe").addClass("active");
	} else {
		$(".line-wireframe").removeClass("active");		
	}
	if(Plotter.showAreaWireframe){
		$(".area-wireframe").addClass("active");		
	} else {
		$(".area-wireframe").removeClass("active");		
	}
	if(Plotter.showLine){
		$(".show-line").addClass("active");
	} else {
		$(".show-line").removeClass("active");		
	}
	if(Plotter.showArea){
		$(".show-area").addClass("active");		
	} else {
		$(".show-area").removeClass("active");		
	}
}

Ui.applyValues = function(){
	var mode = $(".plot-real").hasClass("active") ? "real" : "complex";
	Plotter.setMode(mode);	
	Plotter.lineWidth = parseFloat($(".line-width").val());
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
	Plotter.setShowLine($(".show-line").hasClass("active"));
	Plotter.setShowArea($(".show-area").hasClass("active"));
	Plotter.setShowAreaWireframe($(".area-wireframe").hasClass("active"));
	Ui.updateValues();
	Ui.toCookie();
}

Ui.beginPlot = function(){	
	Ui.applyValues();
	var expression = $(".expression-input").val()
	console.log("expression: " + expression);
	Grid.build();
	if(!Plotter.plot(expression)){
		if(Plotter.mode == "real" && Plotter.resultIsComplex){
			alert("Invalid expression:\n\"" + expression + "\"\n" + "Result is complex");			
		} else {
			alert("Invalid expression:\n\"" + expression + "\"");			
		}
	}
}

Ui.toggles = [
	"line-wireframe",
	"area-wireframe",
	"show-line",
	"show-area",
];
Ui.fromCookie = function(){
	$("#ui-1 input[type=text").each(function(){
		var name = "ui-" + $(this).attr("name");
		var val = Storage.window.get(name, null);
		if(val !== null){
			$(this).val(val);
		}
	});
	var mode = Storage.window.get("ui-plot-mode", null);
	if(mode !== null){
		if(mode == "real"){
			$(".plot-real").trigger("click");		
		} else {
			$(".plot-complex").trigger("click");				
		}		
	}
	for(var t in Ui.toggles){
		var name = "ui-" + Ui.toggles[t];
		var val = Storage.window.get(name, null);
		if(val !== null){
			console.log(name, val);
			if(val){
				$("."+Ui.toggles[t]).addClass("active");
			} else {
				$("."+Ui.toggles[t]).removeClass("active");
			}
		}
	}
}
Ui.toCookie = function(){
	$("#ui-1 input[type=text").each(function(){
		var name = "ui-" + $(this).attr("name");
		var val = $(this).val();
		Storage.window.set(name, $(this).val());
	});
	Storage.window.set("ui-plot-mode", $(".plot-real").hasClass("active") ? "real" : "complex");
	for(var t in Ui.toggles){
		var name = "ui-" + Ui.toggles[t];
		var val = $("."+Ui.toggles[t]).hasClass("active");
		Storage.window.set(name, val);
	}
}

