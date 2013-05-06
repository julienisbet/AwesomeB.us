$(document).ready(function() {

  $('form').on('submit', function(e) {
    e.preventDefault();

    var routes = googleRoutes();
    var ordered_routes = orderRoutes(routes);
    pushToPage(ordered_routes);
  })//end of form submit
})//end of doc ready

//GET ROUTES FROM GOOGLE

function googleRoutes() {
  var start_loc = getStartLoc();
  var end_loc   = getEndLoc();
  var dep_time  = getDepTime();
  var arr_time  = getArrTime();

  var query_url = googleQueryUrl(start_loc, end_loc, dep_time);

  var routes = [];
  $.get(query_url, function(result) {
    var google_routes = result.routes;
    $.each(google_routes, function(index, google_route) {
      var route = [];
      var google_steps = google_route.legs[0].steps;
      var steps = transitOrWalkingStep(google_steps);
      route.push(steps);
      var leave_seconds = calculateSecondsToLeaveIn(steps);
      route.push(leave_seconds);
      var leave_times = calculateTimeToLeaveAt(steps);
      route.push(leave_times);
      routes.push(route);
    })//end of each
    
  })//end of google get
  return routes
}

function transitOrWalkingStep(steps_array) { //json array
  var steps = []
  $.each(steps_array, function(step_index, step){
    if (step.travel_mode == "WALKING") {
      var current_step = new WalkingStep(step);
      steps.push(current_step);
    } else {
      var transit_times = getRealTimeTransitData(step);
      current_step = new TransitStep(step, transit_times);
      steps.push(current_step);
    }//end of travel mode if
  })//end of steps each
  return steps
}

function getRealTimeTransitData(step) {
  if (step.agency == "San Francisco Municipal Transportation Agency") {
    var stopTagQueryURL = nextBusStopTag(step.transit_details.line.short_name);
    var prediction_seconds = [];
    $.get(stopTagQueryURL, function(result) {
      var all_next_bus_line_info = $.xml2json(result);
      var all_stops_on_line = all_next_bus_line_info.route.stop;
      var right_stop = getTheRightStop(all_stops_on_line, step);
      prediction_seconds = getPredictions(right_stop, step);
    })//end of nextbus stops get
    return prediction_seconds
  }//end of check agency if
}

function getTheRightStop(stops_array, step) {
  $.each(stops_array, function(stop_index, stop) {
    if (stopHasMatchingLatLong(stop, step)) {
      return stop;
    }//end of lat long match if
  })//end of all stops each
}

function orderRoutes(routes) {

}

function stopHasMatchingLatLong(stop, step) {
  var rounded_stop_latitude = roundNumber(stop.lat, 5);
  var rounded_stop_longitude = roundNumber(stop.lon, 5);
  var rounded_step_latitude = roundNumber(step.start_location.lat, 5);
  var rounded_step_longitude = roundNumber(step.start_location.lng, 5);
  if (rounded_stop_longitude == rounded_step_longitude && rounded_stop_latitude == rounded_step_latitude) { return true }
  return false
}

function getPredictions(stop, step) {
  var predictionsQueryURL = nextBusPredictions(step.transit_details.line.short_name, stop.tag);
  $.get(predictionsQueryURL, function(result) {
    var all_prediction_info = $.xml2json(result);
    var prediction_data = all_prediction_info.predictions.direction.prediction;
    var prediction_seconds = getSecondsFromPredictionData(prediction_data);
    return prediction_seconds
  })//end of predictions get
}

function getSecondsFromPredictionData(predictions_array) {
  var predictions = [];
  $.each(predictions_array, function(prediction_index, prediction) {
    predictions.push(prediction.seconds);
  })//end of predictions each
  return predictions
}

function calculateSecondsToLeaveIn(steps_array) {
  var seconds = [];
  var walk_time = (firstStepIsWalking(steps_array)) ? ( steps_array[0].travel_time ) : ( 0 );
  $.each(steps_array, function(step_index, step) {
    var sec = secondsToLeaveIn(step, walk_time);
    if (sec > 0) { seconds.push(sec); }
  })//end of calculating seconds to leave each
  return seconds;
}

function firstStepIsWalking(steps) {
  if (steps[0].travel_mode == "WALKING") { return true }
  return false
}

function calculateTimeToLeaveAt(steps_array) {
  var times = [];
  var walk_time = (firstStepIsWalking(steps_array)) ? ( steps_array[0].travel_time ) : ( 0 );
  $.each(steps_array, function(step_index, step) {
    times.push(leaveAtTimes(step, walk_time));
  })//end of calculating seconds to leave each
  return times;
}

function orderRoutes(routes) {
  routes.sort(function(a, b) {
    return a[1][0] - b[1][0]
  })
  return routes
}

function pushToPage(routes) {
  alert('hi');
}
