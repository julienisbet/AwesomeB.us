function updatePredictions(routes, startTime) {
  var transit_routes = routes.slice(1, routes.length);
  var now = Math.round(new Date()/1000.0);
  var predicted_seconds = [];
  var walkTime = 0;
  $.each(transit_routes, function(route_index, route) {
    $.each(route.steps, function(step_index, step) {
      if (step.travel_mode == "WALKING") {
        walkTime = step.travel_time;
      }
      if (step.travel_mode == "TRANSIT") {
        $.each(step.seconds_until_departure, function(seconds_index, seconds) {
          var prediction = seconds - (now - startTime) - walkTime;
          if (prediction > 0) {
            predicted_seconds.push(prediction);
          };
        });
        step.seconds_until_departure = predicted_seconds;
      };
    });
  });
  return routes;
}

function findWhatTimeMyBusLeaves(route, chosenTimeIndex) {
  var leavesIn;
  $.each(route.steps, function(step_index, step) {
    if (step.travel_mode == "TRANSIT") {
      var choice = parseInt(step.seconds_until_departure[chosenTimeIndex]);
      var now = Math.round(new Date()/1000.0);
      leavesIn = now + choice;
      return false;
    };
  });
  return convertSecondsToRegularTime(leavesIn);
}

function findHowManySecondsUntilIHaveToLeaveMyHouse(route, chosenTimeIndex, start) {
  var seconds;
  $.each(route.steps, function(step_index, step) {
    if (step.travel_mode == "TRANSIT") {
      seconds = step.seconds_until_departure[chosenTimeIndex];
      return false;
    }
  })
  return seconds;
}
