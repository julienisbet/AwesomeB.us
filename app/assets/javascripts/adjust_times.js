function adjustAllTimesOnAllRoutes(routes, start) {
  var google_info = routes[0];
  var transit_routes = routes.slice(1, routes.length);
  console.log("before", routes);
  $.each(transit_routes, function(index, route) {
    route.leave_seconds = removeSecondsThatHavePassed(route.leave_seconds, start);
    route.bus_arrival = removeBusesThatHaveLeft(route.bus_arrival, start)
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
  
}