if (Meteor.isClient) {
	
	Meteor.startup(function() {
 	
		points = new Meteor.Collection('pointsCollection');
		isReactive = true;
		lineWidth = "2";
		lineColor = "#000000";
		
		Meteor.subscribe('pointsSubscription', function() {

		    Deps.autorun(function() {
		    	if (isReactive == true) {
		    		console.log("Is Reactive");
					var data = points.find({}).fetch();	
					var canvas = document.getElementById('sketchpad');
					var context = canvas.getContext("2d");
					var executeOnce = true;
					var currentLine = 1;
					
					if (data.length > 0) {
					    
			        	for (i=0; i<data.length-1; i++) {
							
							//console.log("Current Line: " + currentLine + " Data LineNumber: " + data[i].lineNumber);
							
							if (data[i].lineNumber == currentLine) {
								//console.log("Execute Once: " + executeOnce + " Data Line Number: " + data[i].lineNumber + " currentLine: " + currentLine);
								executeOnce = true;
								currentLine++;
							}
							
							if (executeOnce == true) {
								context.beginPath();
								context.strokeStyle = data[i].lineColor;
							 	context.lineWidth = data[i].lineWidth;
                      			context.lineJoin = "round"; 
					  			context.lineCap = "round";
								context.moveTo(data[i].x, data[i].y);
								//console.log("Execute Once: " + executeOnce);
								executeOnce = false;
						    } else {
								//var xCoords = (data[i].x + data[i - 1].x) / 2;
				        		//var yCoords = (data[i].y + data[i + 1].y) / 2;
				        		//context.quadraticCurveTo(data[i].x, data[i].y, data[i-1].x, data[i-1].y);
				        		context.lineTo(data[i].x, data[i].y);
				        		context.stroke();
				        		//console.log("Stroke - X: " + data[i].x + " Y: " + data[i].y);
							}
							
				    	}
				    	
						//for(i=0;i<data.length;i++) {
						//	console.log("Line Number " + data[i].lineNumber);
						//	console.log("X Coordinate " + data[i].x);
						//	console.log("Y Coordinate " + data[i].y);		
				 		//}
				    }	
				    
				}
			         
			});
		});
		
 		var nextLine = 1;
 		
		//Deps.autorun(function() {
			
	    	var data = points.find().fetch();
			console.log("Retrieved Data");
			
			if (data.length > 0) {
				if (data[data.length-1].lineNumber > nextLine) {
					nextLine = data[data.length-1].lineNumber + 1;
					console.log("Next Line " + nextLine);
				}
			} 
			
			Template.canvas.rendered = function() {
				var canvas = document.getElementById('sketchpad');
		        var context = canvas.getContext('2d');
				var coordinates = document.getElementById('coordinates');
 				var pointsCollectionList = [];
		
                // create a drawer which tracks touch movements
                var drawer = {
                   isDrawing: false,
                   touchstart: function(coors){
					  console.log("Touch Start: " + nextLine);
                      context.beginPath();
                      context.strokeStyle = lineColor;
                      context.lineWidth = lineWidth;
                      context.lineJoin = "round"; 
					  context.lineCap = "round";
                      context.moveTo(coors.x, coors.y);
                      this.isDrawing = true;
                      pointsCollectionList = [];
                      pointsCollectionList.push({ lineNumber : nextLine, lineWidth : lineWidth, lineColor : lineColor, x: (coors.x), y: (coors.y)} );
					  /* points.insert({ 
					  lineNumber: nextLine,
					  	x: (coors.x),
					  	y: (coors.y)
					  }); */
					  isReactive = false;
					  coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;
                   },
                   touchmove: function(coors){
                      if (this.isDrawing) {
						 console.log("Touch Move: " + nextLine);
                         context.lineTo(coors.x, coors.y);
                         context.stroke();
                         pointsCollectionList.push( { lineNumber : nextLine, lineWidth : lineWidth, lineColor : lineColor, x: (coors.x), y: (coors.y)});
					   /* points.insert({ 
							lineNumber: nextLine,
						 	x: (coors.x),
						    y: (coors.y)
						 }); */
						 isReactive = false;
						 coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;
                      }
                   },
                   touchend: function(coors){
                      if (this.isDrawing) {
                      	 nextLine++;
						 console.log("Touch End: " + nextLine + " " + pointsCollectionList[0].lineNumber);
                         //this.touchmove(coors);
                         this.isDrawing = false;
                         isReactive = true;
                         
                         for (i=0;i<pointsCollectionList.length-1;i++) {
						     points.insert({ 
							 	lineNumber: pointsCollectionList[i].lineNumber,
							 	lineWidth : pointsCollectionList[i].lineWidth,
							 	lineColor : pointsCollectionList[i].lineColor,
							 	x: pointsCollectionList[i].x,
							 	y: pointsCollectionList[i].y
							 });
	                      }
	               	  }
                   }
                };

                // create a function to pass touch events and coordinates to drawer
                function draw(event){
                   // get the touch coordinates
                   var coors = {
                      x: event.targetTouches[0].pageX,
                      y: event.targetTouches[0].pageY
                   };
                   // pass the coordinates to the appropriate handler
                   drawer[event.type](coors);       
				}
				
				// create a function to pass touch events and coordinates to drawer
                function touchEndDraw(event){
                   // get the touch coordinates
                   var coors = {
                      x: 0,
                      y: 0
                   };
                   // pass the coordinates to the appropriate handler
                   drawer[event.type](coors);       
				}
				
                // attach the touchstart, touchmove, touchend event listeners.
                canvas.addEventListener('touchstart', draw, false);
                canvas.addEventListener('touchmove', draw, false);
                canvas.addEventListener('touchend', touchEndDraw, false);
        
                // prevent elastic scrolling
                document.body.addEventListener('touchmove',function(event){
                  event.preventDefault();
                },false);

				document.getElementById("clearCanvasButton").onclick = function() {
					Meteor.call('clear', function() {
						//var canvas = document.getElementById('sketchpad');
						//canvas.clear();
						//points.remove({});
						Meteor.call('clear')
						//location.reload();
						
					});
				}
				
				document.getElementById("lineWidthSmallButton").onclick = function() {
					lineWidth = "2";
				}
				
				document.getElementById("lineWidthMediumButton").onclick = function() {
					lineWidth = "4";
				}
				
				document.getElementById("lineWidthLargeButton").onclick = function() {
					lineWidth = "6";
				}
				
				document.getElementById("colorBlackButton").onclick = function() {
					lineColor = "#000000";
				}
				
				document.getElementById("colorBlueButton").onclick = function() {
					lineColor = "#0000FF";
				}
				
				document.getElementById("colorRedButton").onclick = function() {
					lineColor = "#FF0000";
				}
				
				document.getElementById("colorGreenButton").onclick = function() {
					lineColor = "#00FF00";
				}
				
				document.getElementById("colorYellowButton").onclick = function() {
					lineColor = "#FFFF00";
				}
				 
			}

		//});
 
  	});	
}
		
// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
   
 	points = new Meteor.Collection('pointsCollection');

	Meteor.publish('pointsSubscription', function() {
	  return points.find();
	});

	Meteor.methods({
	  'clear': function () {
	    points.remove({});
	  }
	});
}