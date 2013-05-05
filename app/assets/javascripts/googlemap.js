  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;

  function initializeMap() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    directionsDisplay.setMap(map);
    calcRoute();
  }

  function calcRoute() {
    var start = $("input#start_location").val();
    var end = $("input#end_location").val();
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.TRANSIT,
        provideRouteAlternatives: true,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        directionsDisplay.setRouteIndex(1);
        console.log(response);
        console.log(directionsDisplay.getRouteIndex())
      }
    });
  }

$("a .go").on("click", function(e){
  initializeMap();
})
