function adjustAllTimesOnAllRoutes(routes, start) {
  var google_info = routes[0];
  var transit_routes = routes.slice(1, routes.length);
  console.log("before", routes);
  $.each(transit_routes, function(index, route) {
    route.leave_seconds = removeSecondsThatHavePassed(route.leave_seconds, start);
    route.bus_arrival = removeBusesThatHaveLeft(route.bus_arrival, start);
    route.next_departures = removeNextBusDepartures(route.next_departures, start)
  });
  console.log("after", routes);
  return routes;
}

function removeSecondsThatHavePassed(seconds_array, start) {
  var now = Math.round(new Date()/1000.0);
  var keep_these = [];
  $.each(seconds_array, function(index, seconds_till_you_need_to_leave) {
    if ((now - start) < seconds_till_you_need_to_leave) {
      keep_these.push(seconds_till_you_need_to_leave);
    };
  });
  return keep_these;
}

function removeBusesThatHaveLeft(bus_arrival_array, start) {
  var now = Math.round(new Date()/1000.0);
  var keep_these = [];
  $.each(bus_arrival_array, function(index, value) {
    if (value > now) {
      keep_these.push(value);
    };
  });
  return keep_these;
}

function removeNextBusDepartures(next_departures_array, start) {
  var now = Math.round(new Date()/1000.0);
  var keep_these = [];
  $.each(next_departures_array, function(index, bus_leaves_in_minutes) {
    if ((now - start) < (bus_leaves_in_minutes*60)) {
      keep_these.push(bus_leaves_in_minutes);
    };
  });
  return keep_these;
}