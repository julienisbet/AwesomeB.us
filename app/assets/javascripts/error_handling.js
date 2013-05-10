function noPredictionErrors(steps) {
  var blah = false;
  $.each(steps, function(index, step) {
    if (step.travel_mode == "TRANSIT") {
      if (step.seconds_until_departure instanceof Array) { blah = true; }
    }
  })
  return blah;
}

function addError(error){
  $('.error_message').html(error);
  $('.error_message').slideDown();
}
