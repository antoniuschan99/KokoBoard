if (Meteor.isClient) {
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

                   },
                   touchmove: function(coors){
                      if (this.isDrawing) {
                         context.lineTo(coors.x, coors.y);
                         context.stroke();
					   coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;

                      }
                   },
                   touchend: function(coors){
                      if (this.isDrawing) {
                         this.touchmove(coors);
                         this.isDrawing = false;
					   coordinates.innerHTML = "Coordinates X: " + coors.x + " Coordinates Y: " + coors.y;

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
  Meteor.startup(function () {

  });
}