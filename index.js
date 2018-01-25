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
var hidden_features = [];

var qualitative_features = ["Timestamp", "Alias", "Degree", "Major", "Interests", "Expectations"];
var knownMajors = ['Computer Science', 'Media Technology', 'Human-Computer Interaction']

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

/*
Set color based on user selection */
function get_color(major) { 
  switch(major) 
 {  		case "Computer Science":
   			return "red";
   		case "Media Technology":
   			return "green";
   		case "Human-Computer Interaction":
   			return "blue";
   		default:
   			return "cyan";
   	}
}

//TODO could be useful for breaking down time intervals
function get_attr_value(data, attribute_name) {
	var result = [];
	for(var i = 0; i < data.length; i++) {
		result.push(data[i][attribute_name]);	
	}
	return result;
}

/*
Filters data based on query selection */
function filter_data(data) {

	var filtered = [];
	console.log(data);
	for(var i = 0; i < data.length; i++) {
		if(!include_majors.includes(data[i]['Major'])) {
			
			//Major belongs to "others"
			if(!knownMajors.includes(data[i]['Major']) && include_majors.includes('Other')) {
				filtered.push(data[i]);
			}
		}
		else {
			filtered.push(data[i]);
		}
	}
	return filtered;
}

function load_parallell_coordinates() {
	//Load data from CSV file on startup
	d3.csv(
		"http://localhost:8888/survey.csv", 
		function(d) { return load_full_records(d); }, 
		function(error, rawData) {
			
			var data = filter_data(rawData);
			paracords = d3.parcoords()("#canvas")				
			    .color(function(d) { return get_color(d['Major']); })
			    .data(data)
			    .hideAxis(hidden_features)
			    .composite("darker")
			    .render()
			    .shadows()
			    .reorderable()
			    .brushMode("1D-axes");
			    //.alphaOnBrushed(0.1)
			    //.alpha(0.1)
			   	//.shadows()
			    

			paracords.svg.selectAll(".dimension")
				//.on("click", change_color)
			paracords.svg.selectAll(".label")
				 .attr("transform", "translate(-5,-5) rotate(0)")
			parcoords.margin({
			  top: 100,
			  left: 0,
			  right: 0,
			  bottom: 20
			})
			//paracords.brushedColor("#000");
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

/*
Called from angular controller to update list of hidden features, and redraw model*/
function update_model2(selected) {	
	include_majors = selected;
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


app.controller('majorSelectionController', ['$scope', 'filterFilter', function ObjectArrayCtrl($scope, filterFilter) {
	  // Dimensions
	  $scope.majors = [
		{ name: 'Media Technology', color: 'green', selected: true},
		{ name: 'Human-Computer Interaction', color: 'blue', selected: true},	
		{ name: 'Computer Science', color: 'red', selected: true},
		{ name: 'Other', color: 'cyan', selected: false}
	  ];

	  // Selected majors
	  $scope.selectedMajors = [];
	  $scope.hideMajors = [];

	  // Helper method to get selected features
	  $scope.selectedMajors = function selectedMajors() {	  	
	    return filterFilter($scope.majors, { selected: true });
	  };

	  //Update list of selected features. 
	  $scope.$watch('majors|filter:{selected:true}', function (nv) {
	    $scope.selectedMajors = nv.map(function (major) {	      
	      return major.name;
	    });
	    update_model2($scope.selectedMajors);
	  }, true);

	  //Update list of hidden features, update PC model
	  $scope.$watch('majors|filter:{selected:false}', function (nv) {	    
	    $scope.hideMajors = nv.map(function (major) {
	      return major.name;
	    });
	    //update_model2($scope.hideMajors);
	  }, true);
}]);

/*
Iniital construction of Parallell Coordinates */
document.addEventListener('DOMContentLoaded', function() { load_parallell_coordinates(); });