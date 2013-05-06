
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
  var loc = $("input[id=start_location]").val();
  return loc;
}

function getEndLoc() {
  var loc = $("input[id=end_location]").val();
  return loc;
}

function getDepTime() {
  var dep_time = Math.round(new Date().getTime()/1000);
  return dep_time;
}

function getArrTime() {
  var arr_time = Math.round(new Date().getTime()/1000) + 3600;
  return arr_time;
}

function googleQueryUrl(start_loc, end_loc, dep_time) {
  var query_url = "https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=";
  query_url += start_loc;
  query_url += "&destination=";
  query_url += end_loc;
  query_url += "&sensor=false&departure_time=";
  query_url += dep_time;
  return (query_url + "&mode=transit")
}

function TransitStep(step, transit_seconds, google_step) {
  this.travel_mode = step.travel_mode;
  this.travel_time = step.duration.value;
  this.start_latitude = roundNumber(step.transit.arrival_stop.location.lat(), 5);
  this.start_longitude = roundNumber(step.transit.arrival_stop.location.lng(), 5);
  this.agency = step.transit.line.agencies[0].name;
  this.direction = step.transit.headsign;
  this.start_stop_name = step.transit.departure_stop.name;
  this.end_stop_name = step.transit.arrival_stop.name;
  this.end_latitude = step.end_location.lat();
  this.end_longitude = step.end_location.lng();
  this.line_name = step.transit.line.name;
  this.line_short_name = step.transit.line.short_name;
  this.transit_seconds = transit_seconds;
  this.google_step = google_step;
}

function WalkingStep(step) {
  this.travel_mode = step.travel_mode;
  this.travel_time = step.duration.value;
  this.start_latitude = roundNumber(step.start_location.lat(), 5);
  this.start_longitude = roundNumber(step.start_location.lng(), 5);
}

function Trip(start_loc, end_loc, dep_time, arr_time) {
  this.start_loc = start_loc;
  this.end_loc = end_loc;
  this.dep_time = dep_time;
  this.arr_time = arr_time;
}

function nextBusStopTag(line_short_name) {
  var stop_tag_url = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=";
  stop_tag_url += line_short_name;
  return stop_tag_url
}

function nextBusPredictions(line_short_name, stop_tag_name) {
  var prediction_url = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=";
  prediction_url += line_short_name;
  prediction_url += "&s=";
  prediction_url += stop_tag_name;
  return prediction_url
}

function Departure(name) {
  this.tag_name = name;
  this.departure_seconds = [];
  this.leave_in_seconds = [];
  this.leave_at_times = [];
}
