function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  }
}
function showPosition(position) {
  $(".geolocation").attr("id",position.coords.latitude + "," + position.coords.longitude);
}