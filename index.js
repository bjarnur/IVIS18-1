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
		"Graphics_Programming" : +data["Graphics_Programming"],
		"HCI Programming" : +data["HCI Programming"],
		"UX Evaluation" : +data["UX Evaluation"],
		"Code Repository" : +data["Code Repository"]
	};
}

function initialize_paracoords(data, error) {

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

// color scale for zscores
var zcolorscale = d3.scale.linear()
  .domain([1,10])
  //.range(["brown", "#999", "#999", "steelblue"])
  .range(["#ffcccc", "#800000"])
  .interpolate(d3.interpolateLab);


//Load data from CSV file on startup
d3.csv(
	"http://localhost:8888/survey.csv", 
	function(d) { return load_full_records(d); }, 
	function(error, data) {
		paracords = d3.parcoords()("#canvas")
		    .data(data)
		    .hideAxis([	"Timestamp", "Alias", "Degree", "Major", "Interests", 
		    			"Expectations", "Information_Visualization", 
		    			"Computer_Graphics_Programming", "Code_Repository", 
		    			"Human_Computer_Interaction_Programming", "Mathematic"])
		    .render()
		    .shadows()
		    .brushMode("1D-axes")  // enable brushing
		    //.createAxes() //??
		    .reorderable();

		//set_color("Degree");
	 	change_color("Programming");

	 	paracords.svg
	 		.style("margin: 10px")

		// click label to activate coloring
		paracords.svg.selectAll(".dimension")
			.on("click", change_color)
			.selectAll(".label")
			.style("font-size", "14px");

		paracords.svg.selectAll(".label")
			 .attr("transform", "translate(5,-3) rotate(10)")

		//<text text-anchor="middle" y="0" transform="translate(0,-5) rotate(0)" x="0" class="label" style="font-size: 14px;">Programming</text>
	}
);


	// update color
	function change_color(dimension) {
	  paracords.svg.selectAll(".dimension")
	    .style("font-weight", "normal")
	    .filter(function(d) { return d == dimension; })
	    .style("font-weight", "bold")

	  console.log(paracords.data()) //TODO: Get all values of dimension
	  
	  var color = zcolorscale(paracords.data().dimension);
	  paracords.color(color).render();
	};
