function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition)
  }
}
function showPosition(position) {
  console.log("id",position.coords.latitude,",", position.coords.longitude)
  $(".geolocation").attr("id",position.coords.latitude + "," + position.coords.longitude);
}

//the way this is getting called when the page loads means we are relying on the
//user taking so long to type their address that the geolocator has probably come
//back with an address.
//we need to instead check that the current location has come back before making the
//call to google.
//also it would probably be better user experience for it to ask the user
//if it is okay to use their current location when they click go or something similar
//rather than as soon as the page loads
//however it's not currently breaking anything so we will fix it later.
