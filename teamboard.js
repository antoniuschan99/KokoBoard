if (Meteor.isClient) {
	points = new Meteor.Collection('pointsCollection');
	
	Deps.autorun(function () {
	  Meteor.subscribe('pointsSubscription');
	});
	
	Meteor.startup(function() {
 	
	    Deps.autorun(function() {
	    	var data = points.find({}).fetch();
			var canvas = document.getElementById('sketchpad');
			var context = canvas.getContext("2d");
 			context.beginPath();
			
			context.moveTo(data[0].x, data[0].y);
			
			for (i=1; i<data.length-2; i++) { 
				var xCoords = (data[i].x + data[i + 1].x) / 2;
				var yCoords = (data[i].y + data[i + 1].y) / 2;
				context.quadraticCurveTo(data[i].x, data[i].y, xCoords, yCoords);
				context.stroke();
			}
			
			// curve through the last two points
			context.quadraticCurveTo(data[i].x, data[i].y, data[i+1].x,data[i+1].y);
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
					  points.insert({ 
					  	x: (coors.x),
					    y: (coors.y)
					  });
                   },
                   touchmove: function(coors){
                      if (this.isDrawing) {
                         context.lineTo(coors.x, coors.y);
                         context.stroke();
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

		Template.canvas.events({ 
			'click input': function(event) {
				Meteor.call('clear', function() {
					var canvas = document.getElementById('sketchpad');
					canvas.clear();
				});
			}
		});
	
}
		

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
	Meteor.startup(function () {
  
 	points = new Meteor.Collection('pointsCollection');

	Meteor.publish('pointsSubscription', function() {
	  return points.find();
	});

	Meteor.methods({
	  'clear': function () {
	    points.remove({});
	  }
	});
});
}