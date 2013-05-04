
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(37.7750, -122.4183),
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);

// center: new google.maps.LatLng(37.7750, 122.4183),
