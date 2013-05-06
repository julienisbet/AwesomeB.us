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
    }
  });
};

function initializeMap() {
  directionsDisplay = new google.maps.DirectionsRenderer();
  var mapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  }
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  directionsDisplay.setMap(map);
}

function renderRoute(route_array, index) {
  initializeMap();
  directionsDisplay.setDirections(route_array);
  directionsDisplay.setRouteIndex(index);
}

function renderDetails(route) {
  debugger
  var line = route.steps[1].line_short_name;
  var leaving_at = route.leave_times;
  var arriving_at = route.leave_times + route.steps[1].travel_time;
  $("#fetch.route").val(line);
  $("#fetch.leave").val(leaving_at);
  $("#fetch.arrive").val(arriving_at);
};
