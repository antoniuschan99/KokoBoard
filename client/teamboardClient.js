Meteor.startup(function() {
 	
	var points = new Meteor.Collection('pointsCollection');
	var isReactive = true;
	var lineWidth = "2";
	var lineColor = "#000000";
	var nextLine = 1;
	
	Meteor.subscribe('pointsSubscription', function() {

	    Deps.autorun(function() {
	    	
	    	if (isReactive == true) {
				var data = points.find({}).fetch();	
				var canvas = document.getElementById('sketchpad');
				var context = canvas.getContext("2d");
				var executeOnce = true;
				var beginPath = false;
				var currentLineCoordinates = [];
				var currentLine = 1;

				if (data.length > 0) {	
				    					    
		        	for (i=0; i<data.length-1; i++) {

						if (data[i].lineNumber >= currentLine) {
							executeOnce = true;
							currentLine++;
						}
						
						if (executeOnce == true) {
							executeOnce = false;
							beginPath = true;
							currentLineCoordinates = { x : data[i].x, y : data[i].y };
					    } else if (beginPath == true) {
							beginPath = false;
							context.beginPath();
							context.strokeStyle = data[i].lineColor;
						 	context.lineWidth = data[i].lineWidth;
                  			context.lineJoin = "round"; 
				  			context.lineCap = "round";
							context.moveTo(currentLineCoordinates.x, currentLineCoordinates.y);
						} else {
			        		context.lineTo(data[i].x, data[i].y);
			        		context.stroke();
						}
						
			    	}
			    } else {
			    	context.clearRect(0, 0, canvas.width, canvas.height);
			    }	
			    
			}
		         
		});
	});
	 				
	Deps.autorun(function() {
    	var data = points.find().fetch();
 		if (data.length > 0) {
			if (data[data.length-1].lineNumber > nextLine) {
				nextLine = data[data.length-1].lineNumber + 1;
			}
		} 
	});
		
	Template.canvas.rendered = function() {
		var canvas = document.getElementById('sketchpad');
        var context = canvas.getContext('2d');
		var coordinates = document.getElementById('coordinates');
		var pointsCollectionList = [];
		var lineWidthElementId = "lineWidthSmallButton";
   		var lineColorElementId = "colorBlackButton";
   		
        var drawer = {
           isDrawing: false,
           touchstart: function(coors){
              context.beginPath();
              context.strokeStyle = lineColor;
              context.lineWidth = lineWidth;
              context.lineJoin = "round"; 
			  context.lineCap = "round";
              context.moveTo(coors.x, coors.y);
              this.isDrawing = true;
              pointsCollectionList = [];
              pointsCollectionList.push({ lineNumber : nextLine, lineWidth : lineWidth, lineColor : lineColor, x: (coors.x), y: (coors.y)} );
			  isReactive = false;
           },
           touchmove: function(coors){
              if (this.isDrawing) {
                 context.lineTo(coors.x, coors.y);
                 context.stroke();
                 pointsCollectionList.push( { lineNumber : nextLine, lineWidth : lineWidth, lineColor : lineColor, x: (coors.x), y: (coors.y)});
				 isReactive = false;
              }
           },
           touchend: function(coors){
              if (this.isDrawing) {
              	 nextLine++;
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

        function draw(event){
           var coors = {
              x: event.targetTouches[0].pageX,
              y: event.targetTouches[0].pageY - 75
           };
           drawer[event.type](coors);       
		}
		
        function touchEndDraw(event){
           var coors = {
              x: 0,
              y: 0
           };
           drawer[event.type](coors);       
		}
		
        canvas.addEventListener('touchstart', draw, false);
        canvas.addEventListener('touchmove', draw, false);
        canvas.addEventListener('touchend', touchEndDraw, false);

        document.body.addEventListener('touchmove',function(event){
        	event.preventDefault();
        },false);

		document.getElementById("clearCanvasButton").onclick = function() {
			var confirmResult = confirm("Are you sure you want to clear the canvas?");
			
			if (confirmResult == true) {
				Meteor.call('clear');
				location.reload();
			}
		}
		
		lineWidthEventHandler = function(elem) {
			document.getElementById(lineWidthElementId).style.border="3px solid grey";
			
			lineWidthElementId = elem.getAttribute("data-element-id");
			lineWidth = elem.getAttribute("data-line-width");
			
			document.getElementById(lineWidthElementId).style.border="3px solid white";
		}
		
		lineColorEventHandler = function(elem) {
			document.getElementById(lineColorElementId).style.border="3px solid grey";
			
			lineColorElementId = elem.getAttribute("data-element-id");
			lineColor = elem.getAttribute("data-line-color");
			
			document.getElementById(lineColorElementId).style.border="3px solid white";
		}	
	}
 
});