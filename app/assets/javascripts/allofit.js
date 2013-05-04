$(document).ready(function () {

  $('form').on('submit', function(e) {
    e.preventDefault();

    var start_loc = getStartLoc();
    var end_loc   = getEndLoc();
    var dep_time  = getDepTime();
    var arr_time  = getArrTime();

    var query_url = googleQueryUrl(start_loc, end_loc, dep_time);

    $.get(query_url, function(result) {
      var routes = [];
      $.each(result.routes, function(index, google_routes) {
        var google_steps = google_routes.legs[0].steps;
        var steps = [];

        $.each(google_steps, function(index,step){
          if (step.travel_mode == "WALKING") {
            var current_step = new WalkingStep(step);
            steps.push(current_step);
          } else {
            var current_step = new TransitStep(step);
            steps.push(current_step);
          }//end of if else
        })//end of each

        routes.push(steps);
      
      })//end of each

      $.each(routes, function(index, route) {
        $.each(route, function(index, step) {
          if (step.travel_mode == "WALKING") {
            //manipulate time?
          } else {

            if (step.agency == "San Francisco Municipal Transportation Agency") {
              var stopTagQueryURL = nextBusStopTag(step.line_short_name);

              $.get(stopTagQueryURL, function(result) {
                var stops = result.getElementsByTagName('stop');

                $.each(stops, function(index, stop) {

                  if (stop.attributes.length > 1) {
                    var roundedLatitude = roundNumber((stop.attributes[2].nodeValue), 5);
                    var roundedLongitude = roundNumber((stop.attributes[3].nodeValue), 5);

                    if ((roundedLatitude == step.start_latitude) && (roundedLongitude == step.start_longitude)) {
                      var stopTagName = stop.attributes[0].nodeValue;
                      var myDeparture = new Departure(stopTagName);

                      var predictionsQueryURL = nextBusPredictions(step.line_short_name, myDeparture.tag_name);
                      
                      $.get(predictionsQueryURL, function(result) {
                        var predictions = result.getElementsByTagName('prediction');

                        $.each(predictions, function(index, prediction) {
                          var prediction_time = prediction.attributes[1].nodeValue;

                          myDeparture.departure_times.push(prediction_time);
                          step.departure = myDeparture;
                        })//end of prediction each
                      })//end of departure time predictions get
                    }//end of latitude and longitude comparison if
                  }//end of stop attribute length if
                })//end of stop each
              })//end of stop tag get
            }//end of agency if
          }//end of travel mode if else
        })//end of step each
      })// end of route each
      console.log(routes);
    })// end of google get

  }) //end of form submit

})// end of doc ready

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
  var loc = $("input[name=start_location]").val();
  return loc;
}

function getEndLoc() {
  var loc = $("input[name=end_location]").val();
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

function TransitStep(step) {
  this.travel_mode = step.travel_mode;
  this.travel_time = step.duration.value;
  this.start_latitude = roundNumber(step.start_location.lat, 5);
  this.start_longitude = roundNumber(step.start_location.lng, 5);
  this.agency = step.transit_details.line.agencies[0].name;
  this.direction = step.transit_details.headsign;
  this.start_stop_name = step.transit_details.departure_stop.name;
  this.end_stop_name = step.transit_details.arrival_stop.name;
  this.end_latitude = step.end_location.lat;
  this.end_longitude = step.end_location.lng;
  this.line_name = step.transit_details.line.name;
  this.line_short_name = step.transit_details.line.short_name;
}

function WalkingStep(step) {
  this.travel_mode = "WALKING";
  this.travel_time = step.duration.value;
  this.start_latitude = roundNumber(step.start_location.lat, 5);
  this.start_longitude = roundNumber(step.start_location.lng, 5);
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
  this.departure_times = [];
}
