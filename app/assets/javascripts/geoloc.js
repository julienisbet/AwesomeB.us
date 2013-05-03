$(function(){
  var x = $('input#start_location')
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition)
    }
  }
  function showPosition(position) {
    x.val(position.coords.latitude + "," + position.coords.longitude)
  }
  getLocation()
})