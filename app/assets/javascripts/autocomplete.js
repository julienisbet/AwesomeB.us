function enableAutocomplete() {
  var start = document.getElementById('start_location');
  var end = document.getElementById('end_location');

  var autocomplete = new google.maps.places.Autocomplete(start);
  var autocomplete = new google.maps.places.Autocomplete(end);  
}

