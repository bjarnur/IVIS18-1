/*
	Project trying to best visualize student attributes in order to enable
	optimal decision making when grouping students together. 

  	Thanks to parcoords for a great library! (link below)
  	http://syntagmatic.github.io/parallel-coordinates/ 
*/



//Sanity check
console.log('I like crayons')

/*
Parallell Coordinates model is bound to this */
var paracords;
var hidden_dimensions;
var always_hide = [	"Timestamp", "Alias", "Degree", "Major", "Interests", "Expectations"];

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

function load_parallell_coordinates() {
	//Load data from CSV file on startup
	d3.csv(
		"http://localhost:8888/survey.csv", 
		function(d) { return load_full_records(d); }, 
		function(error, data) {
			paracords = d3.parcoords()("#canvas")
			    .data(data)
			    .hideAxis(hidden_dimensions)
			    .render()
			    .shadows()
			    .brushMode("1D-axes")  // enable brushing
			    //.createAxes() //??
			    .reorderable();

			//set_color("Degree");
		 	//change_color("Programming");

		 	paracords.svg
		 		.style("margin: 10px")

			// click label to activate coloring
			paracords.svg.selectAll(".dimension")
				//.on("click", change_color)
				.selectAll(".label")
				.style("font-size", "14px");

			paracords.svg.selectAll(".label")
				 .attr("transform", "translate(-5,-5) rotate(0)")

			
	});
}

//App entry point
document.addEventListener('DOMContentLoaded', function() { load_parallell_coordinates(); });

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


function update_model(selected) {
	console.log(selected);		
	hidden_dimensions = selected.concat(always_hide);
	console.log(hidden_dimensions);
	
	d3.select("#canvas").html("");
	load_parallell_coordinates();
	//paracords.updateAxes();
}

var app = angular.module("myShoppingList", []); 
app.controller('myCtrl', ['$scope', 'filterFilter', function ObjectArrayCtrl($scope, filterFilter) {
	  // Dimensions
	  $scope.dimensions = [
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

	  // Selected dimensions
	  $scope.selection = [];
	  $scope.hidecollection = [];

	  // Helper method to get selected dimensions
	  $scope.selectedDimensions = function selectedDimensions() {	  	
	    return filterFilter($scope.dimensions, { selected: true });
	  };

	  //Update list of selected dimensions. 
	  $scope.$watch('dimensions|filter:{selected:true}', function (nv) {
	    $scope.selection = nv.map(function (dimension) {	      
	      return dimension.name;
	    });
	  }, true);

	  //Update list of hidden dimensions, update PC model
	  $scope.$watch('dimensions|filter:{selected:false}', function (nv) {	    
	    $scope.hidecollection = nv.map(function (dimension) {	      
	      return dimension.name;
	    });
	    update_model($scope.hidecollection);
	  }, true);
}]);