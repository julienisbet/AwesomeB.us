var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

function calcRoutes(start, end, responseHandler) {
  var request = {
    origin:start,
    destination:end,
    travelMode: google.maps.DirectionsTravelMode.TRANSIT,
    provideRouteAlternatives: true,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
  };
  directionsService.route(request, function(response, status) {

    if (status == google.maps.DirectionsStatus.OK) {
      clickedGo();
      responseHandler(response);
    } else {
      switch(status) {
        case "NOT_FOUND": addError("Cannot find location"); break;
        case "ZERO_RESULTS": addError("No transit directions found"); break;
        default: addError("We're sorry, something went wrong, please try again!");
      }
    }
  });
};

function calcRouteWalk(start, end, responseHandler) {
  var request = {
    origin:start,
    destination:end,
    travelMode: google.maps.DirectionsTravelMode.WALKING,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
  };
  directionsService.route(request, function(response, status) {

    if (status == google.maps.DirectionsStatus.OK) {
      console.log("walk api:", response);
      responseHandler(response);
    } else {
      return 0 // if (return value == false) { throw this shit out }
    }
  });
};

function calcRouteBike(start, end, responseHandler) {
  var request = {
    origin:start,
    destination:end,
    travelMode: google.maps.DirectionsTravelMode.BICYCLING,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      console.log("bike api:", response);
      responseHandler(response);
    } else {
      return 0 // if (return value == false) { throw this shit out }
    }
  });
};

function bikeOrWalkDuration(googsRouteObj) {
  return googsRouteObj.routes[0].legs[0].duration.value;
}

function calcGranolaRoutes(responseHandler) {
  var start_loc;
  var geo_loc = $('.geolocation')[0].id;
  if (getStartLoc() == 'Current Location') { start_loc = geo_loc }
    else { start_loc = getStartLoc() }
  var end_loc   = getEndLoc();
  var dep_time  = getDepTime();
  var arr_time  = getArrTime();
  calcRouteWalk(start_loc, end_loc, function(walkRoute){
    console.log("calcGranolaW:", walkRoute)
    var walkDuration = bikeOrWalkDuration(walkRoute);
    var walk = ["WALKING", walkRoute, walkDuration];
    responseHandler(walk);
  });
  calcRouteBike(start_loc, end_loc, function(bikeRoute){
    console.log("calcGranolaB:", bikeRoute)
    var bikeDuration = bikeOrWalkDuration(bikeRoute);
    var bike = ["BICYCLING", bikeRoute, bikeDuration];
    responseHandler(bike);
  });
}

function initializeMap() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    zoomControl: false
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}

function renderRoute(route_array, index) {
  initializeMap();
  directionsDisplay.setDirections(route_array);
  directionsDisplay.setRouteIndex(index);
}

function renderTransitDetails(route) {
  var first_transit = _.indexOf(route.steps, _.findWhere(route.steps, {travel_mode:"TRANSIT"}))
  var line = route.steps[first_transit].line_short_name;
  var leaving_at = convertSecondsToRegularTime(route.leave_times[0]);
  var next_depart = route.next_departures.slice(1,route.next_departures.length);
  $("#fetch .route").html(line);
  $("#fetch .leave").html(leaving_at);
};
