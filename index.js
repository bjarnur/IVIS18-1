/*
	Project trying to best visualize student attributes in order to enable
	optimal decision making when grouping students together. 

  	Thanks to parcoords for a great library! (link below)
  	http://syntagmatic.github.io/parallel-coordinates/ 
*/


/*
Parallell Coordinates model is bound to this */
var paracords;
/*
Keeps track of what features should currently be hidden */
var hidden_features;
var qualitative_features = ["Timestamp", "Alias", "Degree", "Major", "Interests", "Expectations"];
/*
Selected attribute is used to color cocde graph */
var color_by = '';

/*
Loads all records of all entries in dataset */
function load_full_records(data) {
	return {
		//Qualitative data
		Timestamp : data.Timestamp,
		Alias : data.Alias,
		Degree : data.Degree,
		Major : data.Major,
		Interests : data.Interests,
		Expectations : data.Expectations,
		
		//Quantitative data
		Statistics : +data.Statistics,
		Mathematic : +data.Mathematic,
		Programming : +data.Programming,
		Communication : +data.Communication,
		Collaboration : +data.Collaboration,
		"Information Vis." : +data["Information Vis."],		
		"Drawing/Art" : +data["Drawing/Art"],
		"Computer Usage" : +data["Computer Usage"],		
		"Graphics Programming" : +data["Graphics Programming"],
		"HCI Programming" : +data["HCI Programming"],
		"UX Evaluation" : +data["UX Evaluation"],
		"Code Repository" : +data["Code Repository"]
	};
}

// linear color scale
//var blue_to_brown = d3.scale.linear()
var blue_to_brown = d3.scale.quantize()
  .domain([1, 10])
  .range(["navy", "crimson"])
  //.interpolate(d3.interpolateLab);

// update color
function change_color(dimension) {
  color_by = dimension;
  paracords.svg.selectAll(".dimension")
    .style("font-weight", "normal")
    .filter(function(d) { return d == dimension; })
    .style("font-weight", "bold")
  console.log(color_by);  
  paracords.render;
}

//TODO could be useful for breaking down time intervals
function get_attr_value(data, attribute_name) {
	var result = [];
	for(var i = 0; i < data.length; i++) {
		result.push(data[i][attribute_name]);	
	}
	return result;
}

function load_parallell_coordinates() {
	//Load data from CSV file on startup
	d3.csv(
		"http://localhost:8888/survey.csv", 
		function(d) { return load_full_records(d); }, 
		function(error, data) {
			paracords = d3.parcoords()("#canvas")
			    .data(data)
			    .hideAxis(hidden_features)
			    .composite("darken")
			    .alpha(0.45)			    
			    //.shadows()			    
			    .color(function(d) { return blue_to_brown(d[color_by]); })			    
			    .render()
			    .reorderable()
			    .brushMode("1D-axes");  // enable brushing


			// click label to activate coloring
			paracords.svg.selectAll(".dimension")
				.on("click", change_color)
				.selectAll(".label")
				.style("font-size", "14px");

			paracords.svg.selectAll(".label")
				 .attr("transform", "translate(-5,-5) rotate(0)")

			if(color_by == "") {
				console.log('asdf');
				change_color('Programming');
			}			
	});
}

//Set color based on major, very hard to read
function set_color(entry) {  	
  	switch(entry.Major) {
  		case "Computer Science":
  			return "red";
  		case "Media Technology":
  			return "black";
  		case "Human-Computer Interaction":
  			return "purple";
  		default:
  			return "yellow";
  	}
}

/*
Called from angular controller to update list of hidden features, and redraw model*/
function update_model(selected) {	
	//TODO: Currently redrawing whole model, might be a better way to do this
	hidden_features = selected.concat(qualitative_features);
	d3.select("#canvas").html("");
	load_parallell_coordinates();
}

var app = angular.module("myApp", []); 
app.controller('featureSelectionController', ['$scope', 'filterFilter', function ObjectArrayCtrl($scope, filterFilter) {
	  // Dimensions
	  $scope.features = [
		{ name: 'Statistics', selected: true},
		{ name: 'Mathematic', selected: false},	
		{ name: 'Programming', selected: true},
		{ name: 'Communication', selected: true},
		{ name: 'Collaboration', selected: true},
		{ name: 'Information Vis.', selected: false},
		{ name: 'Drawing/Art', selected: false},
		{ name: 'Computer Usage', selected: false},
		{ name: 'Graphics Programming', selected: false},
		{ name: 'HCI Programming', selected: false},
		{ name: 'UX Evaluation', selected: true},
		{ name: 'Code Repository', selected: false}
	  ];

	  // Selected features
	  $scope.selection = [];
	  $scope.hidecollection = [];

	  // Helper method to get selected features
	  $scope.selectedDimensions = function selectedDimensions() {	  	
	    return filterFilter($scope.dimensions, { selected: true });
	  };

	  //Update list of selected features. 
	  $scope.$watch('features|filter:{selected:true}', function (nv) {
	    $scope.selection = nv.map(function (feature) {	      
	      return feature.name;
	    });
	  }, true);

	  //Update list of hidden features, update PC model
	  $scope.$watch('features|filter:{selected:false}', function (nv) {	    
	    $scope.hidecollection = nv.map(function (feature) {	      
	      return feature.name;
	    });
	    update_model($scope.hidecollection);
	  }, true);
}]);

/*
Iniital construction of Parallell Coordinates */
document.addEventListener('DOMContentLoaded', function() { load_parallell_coordinates(); });