/*
	Project trying to best visualize student attributes in order to enable
	optimal decision making when grouping students together. 

	Used Parallel-Coordinates library (and some examples):
  	http://syntagmatic.github.io/parallel-coordinates/ 
*/



/*
Parallell Coordinates model is bound to this */
var paracords;
/*
Keeps track of what features should currently be hidden */
var hidden_features = [];
/*
Features not included in quantitative visualizations*/
var qualitative_features = ["Timestamp", "Alias", "Degree", "Major", "Interests", "Expectations"];
/*
When true data is color coded by 'Major' attribute*/
var use_colors = true;
/*
Three main classes of 'Major', remaining categorized as 'Other'*/
var known_majors = ['Computer Science', 'Media Technology', 'Human-Computer Interaction']


/*
Loads all records of all entries in dataset */
function load_full_records(data) {
	
	var deadlineStr = '1/16/2018 23:59:59';
	var deadline = Date.parse(deadlineStr);
	var c = Date.parse(data.Timestamp);
	var hours = (deadline - c) / 36e5
	if(hours < 0) {
		console.log(hours);
	}
	
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
		"Code Repository" : +data["Code Repository"],
		"Answ. #hrs before deadline" : hours
	};
}

/*
Set color based on user selection */
function get_color(major) { 
  	if(use_colors) {
	  	switch(major) {
	  		case "Computer Science":
	  			return "red";
	  		case "Media Technology":
	  			return "green";
	  		case "Human-Computer Interaction":
	  			return "blue";
	  		default:
	  			return "cyan";
	  	}
  	}
  	else {
  		return "steelblue";
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
	for(var i = 0; i < data.length; i++) {
		if(!include_majors.includes(data[i]['Major'])) {
			//Major belongs to 'Others' category, which is included
			if(!known_majors.includes(data[i]['Major']) && include_majors.includes('Other')) {
				filtered.push(data[i]);
			}
		}
		else {
			filtered.push(data[i]);
		}
	}
	return filtered;
}

/*
Load data from .csv file, and render Parallell Coordinates*/
function load_parallell_coordinates() {
	
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

			paracords.svg.selectAll(".dimension")
				//.on("click", change_color)
			paracords.svg.selectAll(".label")
				 .attr("transform", "translate(-5,-5) rotate(0)")
	});
}  


/*
Called from angular controller to update list of hidden features, and redraw model*/
function update_feature_selection(features_to_hide) {	
	hidden_features = features_to_hide.concat(qualitative_features);
	redraw_model();
}

/*
Called from angular controller to update list of hidden features, and redraw model*/
function update_major_selection(selected) {	
	include_majors = selected;
	redraw_model();
}

/*
Completely redraws Parallell Coordinates model */
function redraw_model() {
	//TODO: Currently redrawing whole model, might be a better way to do this
	d3.select("#canvas").html("");
	load_parallell_coordinates();
}


var app = angular.module("myApp", []); 
app.controller('featureSelectionController', ['$scope', 'filterFilter', function ($scope, filterFilter) {
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
		{ name: 'Code Repository', selected: false},
		{ name: 'Answ. #hrs before deadline', selected : false}
	  ];

	  // Features that are not included 
	  $scope.features_to_hide = [];

	  // Helper method to get selected features
	  $scope.selectedFeatures = function selectedFeatures() {	  	
	    return filterFilter($scope.features, { selected: true });
	  };

	  //Update list of hidden features, update PC model
	  $scope.$watch('features|filter:{selected:false}', function (nv) {	    
	    $scope.features_to_hide = nv.map(function (feature) {	      
	      return feature.name;
	    });
	    update_feature_selection($scope.features_to_hide);
	  }, true);
}]);


app.controller('majorSelectionController', ['$scope', 'filterFilter', function ($scope, filterFilter) {
	
	//Selection of majors
	$scope.majors = [
		{ name: 'Media Technology', color: 'green', selected: true},
		{ name: 'Human-Computer Interaction', color: 'blue', selected: true},	
		{ name: 'Computer Science', color: 'red', selected: true},
		{ name: 'Other', color: 'cyan', selected: false}
	];

	//Boolean to include colos
	$scope.color = { name: 'Color', selected: false };	  

	// Selected majors
	$scope.selectedMajors = [];

	// Helper method to get selected features
	$scope.selectedMajors = function selectedMajors() {	  	
		return filterFilter($scope.majors, { selected: true });
  	};

	//Update list of included majors
	$scope.$watch('majors|filter:{selected:true}', function (nv) {
		$scope.selectedMajors = nv.map(function (major) {	      
	  		return major.name;
		});
		update_major_selection($scope.selectedMajors);
	}, true);

	$scope.updateColor = function(value){
		use_colors = value;
		redraw_model();
	};
}]);


/*
Iniital construction of Parallell Coordinates */
document.addEventListener('DOMContentLoaded', function() { load_parallell_coordinates(); });