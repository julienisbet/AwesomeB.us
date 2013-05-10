$(document).ready(function() {
  enableAutocomplete();
  getLocation(); //see geoloc.js

  $('a.go').on('click', function(e) {
    e.preventDefault();
    $('.error_message').slideUp();
    if (validateForm() === true) {
      saveHistory();
      // calcGranolaRoutes();
      var start_in_seconds = Math.round(new Date()/1000.0);
      assembleABRoutes(function (routes) {
        var granolaArray = [];
        calcGranolaRoutes(function (granola) { 
          granolaArray.push(granola);
          if (granolaArray.length == 2) {
            $.each(granolaArray, function(i, value){
              if (value[1].status != "OK") {
                granolaArray.slice(i, 1);
              }
            });
            pushToPage(orderRoutes(routes), 1, 0, granolaArray, start_in_seconds);
          }
        });
      });
    }
  })//end of form submit
})//end of doc ready

//GET ROUTES FROM GOOGLE
function clickedGo() {
  $("form").hide();
  $("#fetch").fadeIn();
  $('a.home').show();
};


function assembleABRoutes(cb) {
  var start_loc = findStartLocation();
  var end_loc   = getEndLoc();
  var routes = [];

  calcRoutes(start_loc, end_loc, function(routes_array) {
    var google_routes = routes_array.routes;
    routes.push(routes_array);
    console.log("OG Googs", routes_array)

    var muniRoutes = removeRoutesWithoutTransitSteps(google_routes);
    var muniLength = muniRoutes.length;//

    $.each(muniRoutes, function(index, google_route) {
      var total_travel_time = google_route.legs[0].duration.value;
      var google_steps = google_route.legs[0].steps;

      transitOrWalkingStep(google_steps, function(steps) {
        var route = {};
        route.steps = steps;
        if (noPredictionErrors(steps)) {
          var leave_seconds = calculateSecondsToLeaveIn(steps);
          route.leave_seconds = leave_seconds;
          var leave_times = calculateTimeToLeaveAt(steps);
          route.leave_times = leave_times;
          // var arrive_times = calculateTimeToArriveAt(route.leave_times, total_travel_time);
          // route.arrive_times = arrive_times;
          var next_departures = nextDeparturesInMinutes(steps);
          route.next_departures = next_departures;
          // var bus_arrival_times = calculateBusArrival(steps);
          // route.bus_arrival = bus_arrival_times;
        } else {
          route.leave_seconds = "x"; 
          route.leave_times = "x";
          route.arrive_times = "x";
        }//end of no prediction errors if else
        route.google_index = index;
        route.total_travel_time = total_travel_time;
        routes.push(route);

        if (compareArrayLengths(routes.length, (muniLength + 1))) {
          cb(routes);
        }
      });
    })//end of each
  });
}

function findStartLocation() {
  var start_loc;
  var geo_loc = $('.geolocation')[0].id;
  if (getStartLoc() == 'Current Location') {
    start_loc = geo_loc;
  } else { 
    start_loc = getStartLoc();
  }
  return start_loc;
}

function compareArrayLengths(lengthOfOneArray, lengthOfOtherArray) {
  if (lengthOfOneArray == lengthOfOtherArray) {
    return true;
  } else {
    return false;
  }
}

function removeRoutesWithoutTransitSteps(routes) {
  var onlyMuniRoutes = [];
  $.each(routes, function(index, route) {
    var steps = route.legs[0].steps;
    if (!isWalkingRoute(steps) && !isBARTRoute(steps)) { onlyMuniRoutes.push(route); }
  });
  return onlyMuniRoutes;
}

function transitOrWalkingStep(steps_array, cb) { //json array
  var steps = []
  var len = steps_array.length;

  _.each(steps_array, function(step){
    var current_step;
    if (step.travel_mode == "WALKING") {
      current_step = new WalkingStep(step);
    } else {
      current_step = new TransitStep(step);
      current_step.getTransitSeconds();
    }

    steps.push(current_step);
  })

  var interval = setInterval(function(){
    if(muniRequestsComplete(steps)) {
      clearInterval(interval);
      cb(steps);
    }
  }, 100);
}

function muniRequestsComplete(steps) {
  return _.every(steps, function(step) {
    return step.travel_mode == "WALKING" || step.muni_request_complete;
  })
}

function getTheRightStop(stops_array, step) {
  for (dec=5; dec>2; dec--) {
    for(var i = 0; i < stops_array.length; i++) {
      if (stopHasMatchingLatLong(stops_array[i], step, dec)) {
        return stops_array[i];
      }//end of lat long match if
    }
    console.log("no match at",dec, "trying",dec-1)
  }
  console.log("stops",stops_array)
  console.log("step",step)
  console.log("no right stops")
}

function stopHasMatchingLatLong(stop, step, decimal) {
  var rounded_stop_latitude = roundNumber(stop.lat, decimal);
  var rounded_stop_longitude = roundNumber(stop.lon, decimal);
  var rounded_step_latitude = roundNumber(step.start_latitude, decimal);
  var rounded_step_longitude = roundNumber(step.start_longitude, decimal);
  if (rounded_stop_longitude == rounded_step_longitude && rounded_stop_latitude == rounded_step_latitude) { return true }
    return false
}

function getPredictions(stop, step, callback) {

  var predictionsQueryURL = nextBusPredictions(step.line_short_name, stop.tag);
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
    if (step.travel_mode == "TRANSIT") {
      var muni_seconds = step.seconds_until_departure;
      $.each(muni_seconds, function(index, second_value) {
        var sec = secondsToLeaveIn(second_value, walk_time);
        if (sec > 0) { seconds.push(sec); }
      })
    }
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
    if (step.travel_mode == "TRANSIT") {
      var muni_seconds = step.seconds_until_departure;
      $.each(muni_seconds, function(index, second_value) {
        var now = leaveTimeInSeconds(0, 0);
        var leave_time = leaveTimeInSeconds(second_value, walk_time);
        if (now < leave_time) {
          times.push(leave_time);
        }
      })
    }
  })//end of calculating seconds to leave each
  return times;
}

function calculateTimeToArriveAt(leave_times, travel_time) {
  var times = [];
  $.each(leave_times, function(step_index, time) {
    var arrive_time = arriveTimeInSeconds(time, travel_time);
    times.push(arrive_time);
  });
  return times;
}

function orderRoutes(routes) {
  var goog_response = routes.splice(0,1);
  routes.sort(function(a, b) {
    return a.leave_seconds[0] - b.leave_seconds[0];
  })
  routes.unshift(goog_response[0]);

  return routes
}

function pushToPage(routes, chosenRouteIndex, chosenTimeIndex, granolaArray, start, className) {
  if (className != "WALKING" && className != "BICYCLING"){
    // console.log("routes", routes)
    // console.log("chosenRouteIndex", chosenRouteIndex)
    // console.log("chosenTimeIndex", chosenTimeIndex)
    // console.log("granolaArray", granolaArray)
    // console.log("start", start)

    var updatedRoutes = updatePredictions(routes, start);
    var myRoute = updatedRoutes[chosenRouteIndex];
    var busLeavesAt = findWhatTimeMyBusLeaves(myRoute, chosenTimeIndex);
    renderTransitDetails(myRoute, busLeavesAt);
    

    var google_routes = updatedRoutes[0];
    var route_index = updatedRoutes[chosenRouteIndex].google_index;
    renderRoute(google_routes, route_index);
    
    var seconds = findHowManySecondsUntilIHaveToLeaveMyHouse(myRoute, chosenTimeIndex, start);
    $(".mode").removeClass("bike");
    $(".mode").removeClass("walk");
    displayTimer(seconds);
    
    populateDropDown(updatedRoutes, chosenRouteIndex, chosenTimeIndex, granolaArray, start);
  } else {
    console.log("GRANOLA!!")
    $.each(granolaArray, function(i,v){
      if (v[0] === className) {
        renderGranola(granolaArray, i);
      }
    });
  }
}

function populateDropDown(routes, index, chosenTimeIndex, granolaArray, start) {
  console.log("popdrop",routes)
  $('.dropdownlist > div').remove();
  var chosen_route = routes[index];
  var google_routes = routes.slice(0, 1);
  routes = routes.slice(1, routes.length);
  var chosen_line_name;

  $.each(chosen_route.steps, function(index, step) {
    if (step.travel_mode == "TRANSIT") { chosen_line_name = step.line_short_name; return false; }
  });
  
  var list = [];
  $.each(routes, function(i, route) {
    var line_name;
    $.each(route.steps, function(index, step) {
      if (step.travel_mode == "TRANSIT") { line_name = step.line_short_name; return false; }
    });

    var next_depart_array = route.next_departures;

    $.each(next_depart_array, function(next_depart_index, next_depart) {
      list.push({ bus_name: line_name, depart_mins: next_depart, route_index: (i+1), time_index: next_depart_index});
    });
  });

  list.sort(function(a,b) { return a.depart_mins - b.depart_mins });
  console.log("list before", list)
  list = list.slice(0, 5);
  console.log("list after", list)
  $.each(list, function(index, list_item) {
    if (index > 0) {
      if ((list_item.bus_name != list[index - 1].bus_name) && (list_item.depart_mins != list[index - 1].depart_mins)) {
        $('.dropdownlist').append("<div class='"+list_item.route_index+"' id='"+list_item.time_index+"'><li>"+list_item.bus_name+"</li><li>"+list_item.depart_mins+" mins</li></div")
      };
    };
  });

  routes.unshift(google_routes[0]);

  $.each(granolaArray, function(i, value){
    var time = value[2];
    $('.dropdownlist').append("<div class='"+value[0]+"'><li>"+value[0]+"</li><li>"+time+"</li></div>");
  });

  $('.dropdownlist > div').on('click', function(event){
    event.preventDefault();
    clearInterval(timer);
    pushToPage(routes, this.className, this.id, granolaArray, start, this.className);
  });
}
