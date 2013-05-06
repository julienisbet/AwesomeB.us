$(document).ready(function() {

  $('a .go').on('click', function(e) {
    e.preventDefault();

    googleRoutes(function (routes) {
      pushToPage(orderRoutes(routes));
    });
  })//end of form submit
})//end of doc ready

//GET ROUTES FROM GOOGLE

function googleRoutes(cb) {
  var start_loc = getStartLoc();
  var end_loc   = getEndLoc();
  var dep_time  = getDepTime();
  var arr_time  = getArrTime();

  var query_url = googleQueryUrl(start_loc, end_loc, dep_time);

  var routes = [];
  $.get(query_url, function(result) {
    var google_routes = result.routes;
    var len = google_routes.length;

    function areWeDone() {
      if (routes.length == len) {
        cb(routes);
      }
    }

    $.each(google_routes, function(index, google_route) {
      var google_steps = google_route.legs[0].steps;
      transitOrWalkingStep(google_steps, function(steps) {
        var route = [];
        route.push(steps);
        var leave_seconds = calculateSecondsToLeaveIn(steps);
        route.push(leave_seconds);
        var leave_times = calculateTimeToLeaveAt(steps);
        route.push(leave_times);
        routes.push(route);

        areWeDone();
      });
    })//end of each
    
  })//end of google get
}

function transitOrWalkingStep(steps_array, cb) { //json array
  var steps = []
  var len = steps_array.length;

  steps_array = steps_array.map(function (el, index) {
    return { index: index, el: el };
  });

  function areWeDone() {
    console.log("transit or walking done");
    if (steps.length === len) {
      steps.sort(function (a, b) { return a.index > b.index });
      cb(steps.map(function (el) { return el.el }));
    }
  }

  $.each(steps_array, function(step_index, step){
    var current_step;
    if (step.el.travel_mode == "WALKING") {
      current_step = new WalkingStep(step.el);
      steps.push({ el: current_step, index: step.index });
      areWeDone();
    } else {
      getRealTimeTransitData(step.el, function (sec) {
        current_step = new TransitStep(step.el, sec);
        steps.push({ el: current_step, index: step.index });
        areWeDone();
      });
    }//end of travel mode if
  })//end of steps each
}

function getRealTimeTransitData(step, callback) {
  console.log(step)
  if (step.transit_details.line.agencies[0].name == "San Francisco Municipal Transportation Agency") {
    var line_short = step.transit_details.line.short_name;
    if (line_short == "CALIFORNIA") {
      line_short = "1"
    }
    var stopTagQueryURL = nextBusStopTag(line_short);
    var prediction_seconds = [];
    $.get(stopTagQueryURL, function(result) {
      var all_next_bus_line_info = $.xml2json(result);
      console.log(all_next_bus_line_info);
      var all_stops_on_line = all_next_bus_line_info.route.stop;
      var right_stop = getTheRightStop(all_stops_on_line, step)
      getPredictions(right_stop, step, callback);
    })//end of nextbus stops get

  }//end of check agency if
}

function getTheRightStop(stops_array, step) {
  for(var i = 0; i < stops_array.length; i++) {
    if (stopHasMatchingLatLong(stops_array[i], step)) {
      console.log("xxxx")
      return stops_array[i];
    }//end of lat long match if
  }
  console.log("no right stops")
}

function stopHasMatchingLatLong(stop, step) {
  var rounded_stop_latitude = roundNumber(stop.lat, 2);
  var rounded_stop_longitude = roundNumber(stop.lon, 2);
  var rounded_step_latitude = roundNumber(step.start_location.lat, 2);
  var rounded_step_longitude = roundNumber(step.start_location.lng, 2);
  if (rounded_stop_longitude == rounded_step_longitude && rounded_stop_latitude == rounded_step_latitude) { return true }
  return false
}

function getPredictions(stop, step, callback) {
  var predictionsQueryURL = nextBusPredictions(step.transit_details.line.short_name, stop.tag);
  $.get(predictionsQueryURL, function(result) {
    var all_prediction_info = $.xml2json(result);
    var direction = all_prediction_info.predictions.direction;
    if (direction.length > 0) {
      var prediction_data = direction[0].prediction;
    } else {
      var prediction_data = direction.prediction;
    }

    console.log(all_prediction_info)
    var prediction_seconds = getSecondsFromPredictionData(prediction_data);
    callback(prediction_seconds);
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
  console.log("it worked");
  console.log(routes);
  var seconds = routes[0][0][0].travel_time
  console.log(seconds);
  displayTimer(seconds);
}
