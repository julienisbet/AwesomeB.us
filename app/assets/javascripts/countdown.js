var timer;
var totalSeconds;

function drawTimer(element,color,text,time){
      var canvas = document.getElementById(element);
      var context = canvas.getContext('2d');
      var x = canvas.width / 2;
      var y = canvas.height / 2;
      var radius = Math.min(x,y)*0.90;
      debugger

      var start_angle = 3/2*Math.PI;
      var time_angle = 2*Math.PI / 60 * time;
        //clear previous data
        context.save();
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
        
        context.beginPath();
        context.strokeStyle=color;
        context.lineWidth=20;
        context.arc(x,y,radius,start_angle,start_angle + time_angle,false);
        context.stroke();
        context.closePath();

        var time_text = time.toString();
        context.fillStyle = "white"; // font color to write the text with
        var font = "bold " + 45 +"px serif";
        context.font = font;
        // Move it down by half the text height and left by half the text width
        var width = context.measureText(time_text).width;
        var height_num = context.measureText("w").width; // this is a GUESS of height
        context.fillText(time_text, x - (width/2) ,y + (height_num/2));
        
        context.fillStyle = color; // font color to write the text with
        var font = "bold " + 15 +"px serif";
        context.font = font;
        // Move it down by half the text height and left by half the text width
        var width = context.measureText(text).width;
        var height = context.measureText("w").width; // this is a GUESS of height
        context.fillText(text, x - (width/2) , y + (height_num) + (height/2));
}


function displayTimer(total_seconds) {
  debugger
      var minutes = Math.floor(total_seconds / 60);      
      var seconds = total_seconds - minutes*60;

      drawTimer('top-box1',"green","MINUTES",minutes--)
      drawTimer('top-box2',"yellow","SECONDS",seconds)

      var timer = setInterval(function() { 
        if (seconds==-1) {
          if (minutes==-1) {
            clearInterval(timer);
            alert("GTFO!");
          }
          else {
            seconds=59
            drawTimer('top-box1',"green","MINUTES",minutes--)

          }
        };
      drawTimer('top-box2',"yellow","SECONDS",seconds--)
      }, 250)
}
  

displayTimer(75);