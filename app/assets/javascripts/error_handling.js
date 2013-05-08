function noPredictionErrors(steps) {
  $.each(steps, function(index, step) {
    if (step.travel_mode == "TRANSIT") {
      if (step.transit_seconds instanceof Array) { return false }
    }
  })
  return true
}
