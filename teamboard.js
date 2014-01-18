if (Meteor.isClient) {
	points = new Meteor.Collection('pointsCollection');
	
	Deps.autorun( function () {
	  Meteor.subscribe('pointsSubscription');
	});
	
	Meteor.startup( function() {
 	
	    Deps.autorun( function() {
	    	var data = points.find({}).fetch();
			var canvas = document.getElementById('sketchpad');
			var ctx = canvas.getContext("2d");
 			
			for (i=0; i<data.length; i++) { 
				ctx.fillRect(i, i, 1, 1);
			}
		    //canvas.draw(data);
 	  	});
	});	

    Template.canvas.rendered = function(){
		var canvas = document.getElementById('sketchpad');
        var context = canvas.getContext('2d');
		var coordinates = document.getElementById('coordinates');
                 
                // create a drawer which tracks touch movements
                var drawer = {
                   isDrawing: false,
                   touchstart: function(coors){
                      context.beginPath();
                      context.moveTo(coors.x, coors.y);
                      this.isDrawing = true;
				      coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;
					  points.insert({ 
					  	x: (coors.x),
					    y: (coors.y)
					  });
                   },
                   touchmove: function(coors){
                      if (this.isDrawing) {
                         context.lineTo(coors.x, coors.y);
                         context.stroke();
					     coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;
					     points.insert({ 
						 	x: (coors.x),
						    y: (coors.y)
						 });
                      }
                   },
                   touchend: function(coors){
                      if (this.isDrawing) {
                         this.touchmove(coors);
                         this.isDrawing = false;
					     coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;
					     points.insert({ 
						 	x: (coors.x),
						    y: (coors.y)
						 });
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

                // attach the touchstart, touchmove, touchend event listeners.
                canvas.addEventListener('touchstart',draw, false);
                canvas.addEventListener('touchmove',draw, false);
                canvas.addEventListener('touchend',draw, false);
                
                // prevent elastic scrolling
                document.body.addEventListener('touchmove',function(event){
                  event.preventDefault();
                },false);
        }
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
	
 	points = new Meteor.Collection('pointsCollection');

	Meteor.publish('pointsSubscription', function () {
	  return points.find();
	});

	Meteor.methods({
	  'clear': function () {
	    points.remove({});
	  }
	});

}