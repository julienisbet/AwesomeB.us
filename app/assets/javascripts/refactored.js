$(document).ready(function () {

  $('form').on('submit', function(e) {
    e.preventDefault();
    
    var start_loc = getStartLoc();
    var end_loc   = getEndLoc();
    var dep_time = getDepTime();
    var arr_time = getArrTime();

    var query_url = googleQueryUrl(start_loc, end_loc, dep_time)

    $.get(query_url, function(result) {
      var routes = []
      // returning an object containing an array of all routes
      $.each(result.routes, function(index,google_routes) {
        var google_steps = google_routes.legs[0].steps;
        var steps = [];
        $.each(google_steps, function(index,step){
          if (step.travel_mode == "WALKING") {
            var current_step = new WalkingStep(step)
            steps.push(current_step);
          } else {
            var current_step = new TransitStep(step);
            steps.push(current_step);
          }
        };
        routes.push(steps);
      });
    });
  });
});

function roundNumber(number,decimal_points) {
  if(!decimal_points) return Math.round(number);
  
  if(number == 0) {
    var decimals = "";
    for(var i=0;i<decimal_points;i++) decimals += "0";
    return "0."+decimals;
  }

  var exponent = Math.pow(10,decimal_points);
  var num = Math.round((number * exponent)).toString();
  return num.slice(0,-1*decimal_points) + "." + num.slice(-1*decimal_points)
}

function getStartLoc() {
    loc = $("input[name=start_location]").val();
    return loc;
}

function getEndLoc() {
  return "market and beale st, san francisco";
}

function getDepTime() {
  dep_time = Math.round(new Date().getTime()/1000);
  return dep_time;
}

function getArrTime() {
  arr_time = Math.round(new Date().getTime()/1000) + 3600;
  return arr_time;
}

function googleQueryUrl(start_loc, end_loc, dep_time) {
  query_url = "https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=";
  query_url += start_loc;
  query_url += "&destination="
  query_url += end_loc
  query_url += "&sensor=false&departure_time="
  query_url += dep_time
  return (query_url + "&mode=transit")
}

function TransitStep(step) {
  this.travel_mode = step.travel_mode
  this.travel_time: step.duration.value,
  this.start_latitude: roundNumber(step.start_location.lat, 5),
  this.start_longitude: roundNumber(step.start_location.lng, 5),
  this.agency: step.transit_details.line.agencies[0].name,
  this.direction: step.transit_details.headsign,
  this.start_stop_name: step.transit_details.departure_stop.name,
  this.end_stop_name: step.transit_details.arrival_stop.name,
  this.end_latitude: step.end_location.lat,
  this.end_longitude: step.end_location.lng,
  this.line_name: step.transit_details.line.name,
  this.line_short_name: step.transit_details.line.short_name
}

function WalkingStep(step) {
  travel_mode: "WALKING",
  travel_time: step.duration.value,
  start_latitude: roundNumber(step.start_location.lat, 5),
  start_longitude: roundNumber(step.start_location.lng, 5)
}

function Trip(start_loc, end_loc, dep_time, arr_time) {
  start_loc: start_loc,
  end_loc: end_loc,
  dep_time: dep_time,
  arr_time: arr_time
}
