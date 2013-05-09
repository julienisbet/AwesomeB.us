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
      googleRoutes(function (routes) {
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



function googleRoutes(cb) {
  var start_loc = findStartLocation();
  // var start_loc;
  // var geo_loc = $('.geolocation')[0].id;
  // if (getStartLoc() == 'Current Location') { start_loc = geo_loc }
  //   else { start_loc = getStartLoc() }
  var end_loc   = getEndLoc();
    // var dep_time  = getDepTime();
    // var arr_time  = getArrTime();
  var routes = [];


  calcRoutes(start_loc, end_loc, function(routes_array) {
    var google_routes = routes_array.routes;
    routes.push(routes_array);
    console.log("OG Googs", routes_array)

    var originalLength = google_routes.length;//

    // function areWeDone() {
    //   if (routes.length == (len + 1)) {
    //     cb(routes);
    //   }
    // }

    $.each(google_routes, function(index, google_route) {
      var google_steps = google_route.legs[0].steps;
      var total_travel_time = google_route.legs[0].duration.value;
    //eliminate walking only routes
      var route_steps = google_route.legs[0].steps;
      if (_.indexOf(route_steps, _.findWhere(route_steps, {travel_mode:"TRANSIT"})) == -1) {
        len --;
        //do something
      } else {
        transitOrWalkingStep(google_steps, function(steps) {
          var route = {};
          route.steps = steps;
          if (noPredictionErrors(steps)) {
            var leave_seconds = calculateSecondsToLeaveIn(steps);
            route.leave_seconds = leave_seconds;
            var leave_times = calculateTimeToLeaveAt(steps);
            route.leave_times = leave_times;
            var arrive_times = calculateTimeToArriveAt(route.leave_times, total_travel_time);
            route.arrive_times = arrive_times;
            var next_departures = nextDeparturesInMinutes(steps);
            route.next_departures = next_departures;
            var bus_arrival_times = calculateBusArrival(steps);
            route.bus_arrival = bus_arrival_times;
          } else {
            route.leave_seconds = "x";
            route.leave_times = "x";
            route.arrive_times = "x";
          }//end of no prediction errors if else
          route.google_index = index;
          route.total_travel_time = total_travel_time;
          routes.push(route);

          if (compareArrayLengths(routes.length, (originalLength + 1))) {
            cb(routes);
          }
        });
      }; //end of else
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

function transitOrWalkingStep(steps_array, cb) { //json array
  var steps = []
  var len = steps_array.length;

  steps_array = steps_array.map(function (el, index) {
    return { index: index, el: el };
  });

  function areWeDoneStep() {
    if (steps.length === len) {
      steps.sort(function (a, b) { return a.index - b.index });
      cb(steps.map(function (el) { return el.el }));
    }
  }

  $.each(steps_array, function(step_index, step){
    var current_step;
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
    var line_short = step.transit.line.short_name;
    if (line_short == "CALIFORNIA" || line_short == "Powell-Hyde" || line_short == "Powell-Mason") {
      callback({ no_prediction: "cablecar" });
    } else {
      var stopTagQueryURL = nextBusStopTag(line_short);
      var prediction_seconds = [];

      $.get(stopTagQueryURL, function(result) {
        var all_next_bus_line_info = $.xml2json(result);
        var all_stops_on_line = all_next_bus_line_info.route.stop;
        var right_stop = getTheRightStop(all_stops_on_line, step)
        getPredictions(right_stop, step, callback);
      })//end of nextbus stops get
    }
  }//end of check agency if
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
  var rounded_step_latitude = roundNumber(step.transit.departure_stop.location.lat(), decimal);
  var rounded_step_longitude = roundNumber(step.transit.departure_stop.location.lng(), decimal);
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
    if (step.travel_mode == "TRANSIT") {
      var muni_seconds = step.transit_seconds;
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
      var muni_seconds = step.transit_seconds;
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

function pushToPage(routes, chosenRouteIndex, chosenTimeIndex, granolaArray, start) {

  var updatedRoutes = updatePredictions(routes, start);
  var myRoute = updatedRoutes[chosenRouteIndex];
  var busLeavesAt = findWhatTimeMyBusLeaves(myRoute, chosenTimeIndex);
  renderTransitDetails(myRoute, busLeavesAt);
  

  var google_routes = updatedRoutes[0];
  var route_index = updatedRoutes[chosenRouteIndex].google_index;
  renderRoute(google_routes, route_index);
  
  var seconds = findHowManySecondsUntilIHaveToLeaveMyHouse(myRoute, chosenTimeIndex, start);
  displayTimer(seconds);

  populateDropDown(updatedRoutes, chosenRouteIndex, chosenTimeIndex, granolaArray, start);
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

  $.each(list, function(index, list_item) {
    if (index > 0) {
      if ((list_item.bus_name != list[index - 1].bus_name) && (list_item.depart_mins != list[index - 1].depart_mins)) {
        $('.dropdownlist').append("<div class='"+list_item.route_index+"' id='"+list_item.time_index+"'><li>"+list_item.bus_name+"</li><li>"+list_item.depart_mins+" mins</li></div")
      };
    };
  });

  routes.unshift(google_routes[0]);

  $.each(granolaArray, function(i, value){
    var time = value[3];
    $('.dropdownlist').append("<div class='"+value[0]+"'><li>"+value[0]+"</li><li>"+time+"</li></div>");
  });

  $('.dropdownlist > div').on('click', function(event){
    if (this.id != "WALKING" && this.id != "BICYCLING"){
    event.preventDefault();
    clearInterval(timer)
    pushToPage(routes, this.className, this.id, granolaArray, start);
    } else {
      renderGranolaRoute(granolaArray, this.className);
    }
  });
}
