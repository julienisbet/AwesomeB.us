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
  var arriving_at = convertSecondsToRegularTime(route.arrive_times[0])
  $("#fetch .route").val(line);
  $("#fetch .leave").val(leaving_at);
  $("#fetch .arrive").val(arriving_at);
};

// function populateDropDown(routes) {
//   debugger;
//   $.each(routes, function(rIndex, route) {

//   });
// }
