function noPredictionErrors(steps) {
  var blah = false;
  $.each(steps, function(index, step) {
    if (step.travel_mode == "TRANSIT") {
      if (step.transit_seconds instanceof Array) { blah = true; }
    }
  })
  return blah;
}

function addError(error){
  $('.error_message').html(error);
  $('.error_message').slideDown();
}
