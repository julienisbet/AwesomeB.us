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

  var routes = [];

  calcRoutes(start_loc, end_loc, function(routes_array) {
    var google_routes = routes_array.routes;
    routes.push(google_routes);
    console.log("OG Googs", google_routes)
    var len = google_routes.length;

    function areWeDone() {
      if (routes.length == len) {
        cb(routes);
      }
    }

    $.each(google_routes, function(index, google_route) {
      var google_steps = google_route.legs[0].steps;

      transitOrWalkingStep(google_steps, function(steps) {
        var route = {};
        route.steps = steps;
        var leave_seconds = calculateSecondsToLeaveIn(steps);
        route.leave_seconds = leave_seconds;
        var leave_times = calculateTimeToLeaveAt(steps);
        route.leave_times = leave_times;
        route.google_index = index;
        console.log("new goog route", route, "index", index);
        routes.push(route);

        areWeDone();
      });
    })//end of each
  });

}

function transitOrWalkingStep(steps_array, cb) { //json array
  var steps = []
  var len = steps_array.length;

  steps_array = steps_array.map(function (el, index) {
    return { index: index, el: el };
  });

  function areWeDoneStep() {
    if (steps.length === len) {
      steps.sort(function (a, b) { return a.index > b.index });
      cb(steps.map(function (el) { return el.el }));
    }
  }

  $.each(steps_array, function(step_index, step){
    var current_step;
    console.log("step", step)
    if (step.el.travel_mode == "WALKING") {
      current_step = new WalkingStep(step.el);
      steps.push({ el: current_step, index: step.index });
      areWeDoneStep();
    } else {
      getRealTimeTransitData(step.el, function (sec) {
        current_step = new TransitStep(step.el, sec, step.el);
        steps.push({ el: current_step, index: step.index });
        areWeDoneStep();
      });
    }//end of travel mode if
  })//end of steps each
}

function getRealTimeTransitData(step, callback) {
  if (step.transit.line.agencies[0].name == "San Francisco Municipal Transportation Agency") {
    console.log("tranny", step)
    var line_short = step.transit.line.short_name;
    if (line_short == "CALIFORNIA") {
      line_short = "61";
    } else if (line_short == "Powell-Hyde") {
      line_short = "60";
    } else if (line_short == "Powell-Mason") {
      line_short = "59";
    }
    var stopTagQueryURL = nextBusStopTag(line_short);
    var prediction_seconds = [];

    $.get(stopTagQueryURL, function(result) {
      var all_next_bus_line_info = $.xml2json(result);
      var all_stops_on_line = all_next_bus_line_info.route.stop;
      var right_stop = getTheRightStop(all_stops_on_line, step)
      getPredictions(right_stop, step, callback);
    })//end of nextbus stops get
  }//end of check agency if
}

function getTheRightStop(stops_array, step) {
  for(var i = 0; i < stops_array.length; i++) {
    if (stopHasMatchingLatLong(stops_array[i], step)) {
      return stops_array[i];
    }//end of lat long match if
  
  }
  console.log("no right stops")
  console.log("stops",stops_array)
  console.log("step",step)
}

function stopHasMatchingLatLong(stop, step) {
  var rounded_stop_latitude = roundNumber(stop.lat, 5);
  var rounded_stop_longitude = roundNumber(stop.lon, 5);
  var rounded_step_latitude = roundNumber(step.transit.arrival_stop.location.lat(), 5);
  var rounded_step_longitude = roundNumber(step.transit.arrival_stop.location.lng(), 5);
  if (rounded_stop_longitude == rounded_step_longitude && rounded_stop_latitude == rounded_step_latitude) { return true }
  return false
}

function getPredictions(stop, step, callback) {
  var predictionsQueryURL = nextBusPredictions(step.transit.line.short_name, stop.tag);
  $.get(predictionsQueryURL, function(result) {
    var all_prediction_info = $.xml2json(result);
    var direction = all_prediction_info.predictions.direction;

    if (direction.length > 0) {
      var prediction_data = direction[0].prediction;
    } else {
      var prediction_data = direction.prediction;
    }

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
  var goog_route = routes.splice(0,1);
  routes.sort(function(a, b) {
    return a[1][0] - b[1][0]
  })
  routes.unshift(goog_route);
  return routes
}

function pushToPage(routes) {
  console.log("AMAZING");
  var google_routes = routes[0];
  var index = routes[1].google_index;
  var seconds = parseInt(routes[1].leave_seconds[0]);

  displayTimer(seconds);
  renderRoute(google_routes, index);
  renderDetails(routes[1]);
}


