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
      responseHandler(response);
    } else {
      alert("Google effed up! Google...");
      location.reload();
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
  var times = []
  var seconds = googsRouteObj.routes[0].legs[0].duration.value;
  var readable = googsRouteObj.routes[0].legs[0].duration.text;
  times.push(seconds);
  times.push(readable);
  return times;
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
    var walkDurationSeconds = bikeOrWalkDuration(walkRoute)[0];
    var walkDurationReadable = bikeOrWalkDuration(walkRoute)[1];
    var walk = ["WALKING", walkRoute, walkDurationSeconds, walkDurationReadable];
    responseHandler(walk);
  });
  calcRouteBike(start_loc, end_loc, function(bikeRoute){
    console.log("calcGranolaB:", bikeRoute)
    var bikeDurationSeconds = bikeOrWalkDuration(bikeRoute)[0];
    var bikeDurationReadable = bikeOrWalkDuration(bikeRoute)[1]
    var bike = ["BICYCLING", bikeRoute, bikeDurationSeconds, bikeDurationReadable];
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

function renderGranola(routes, index) {
  var route = routes[index][1];
  var duration = route[3];
  initializeMap();
  directionsDisplay.setDirections(route);
  if (route[0] == "WALKING") { 
    // "walking.jpeg"
  } else {
    // "bike.jpeg"
  }
  $("#fetch .route").html(route[0]);
  $("#fetch .leave").html(route[2]);
}

function renderTransitDetails(route) {
  var first_transit = _.indexOf(route.steps, _.findWhere(route.steps, {travel_mode:"TRANSIT"}))
  var line = route.steps[first_transit].line_short_name;
  var leaving_at = convertSecondsToRegularTime(route.bus_arrival[0]);
  $("#fetch .route").html(line);
  $("#fetch .leave").html(leaving_at);
};
