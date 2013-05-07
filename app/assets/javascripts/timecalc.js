function secondsToLeaveIn(departureSeconds, walkTime) {
  return (parseInt(departureSeconds) - walkTime);
}

function leaveTimeInSeconds(departureSeconds, walkTime) {
  var nowInEpochSeconds = Math.round(new Date()/1000.0);
  var leaveInEpochSeconds = nowInEpochSeconds + parseInt(departureSeconds - walkTime);
  return leaveInEpochSeconds
}

function arriveTimeInSeconds(leaveAtTimeInSeconds, travelTimeInSeconds) {
  return (leaveAtTimeInSeconds + travelTimeInSeconds);
}

function nextDeparturesInMinutes(steps_array) {
  var walk_time = (steps_array[0].travel_mode == "WALKING") ? steps_array[0].travel_time : 0
  var minutes = [];
  $.each(steps_array, function(index, step) {
    if (step.travel_mode == "TRANSIT") {
      $.each(step.transit_seconds, function(index, sec) {
        if (secondsToLeaveIn(sec, walk_time) > 0) { minutes.push(roundNumber((sec / 60), 0)) }
      })
    }
  })
  return minutes;
}

function convertSecondsToRegularTime(seconds) {
  var date = new Date(seconds * 1000);
  var UTCHours = date.getUTCHours();
  var hours = ((UTCHours - 7) + 12) % 12;
  if (hours == 0) { hours = 12; }
  var UTCMinutes = date.getUTCMinutes();
  var UTCSeconds = date.getUTCSeconds();
  var time = (hours + ":" + leadingZeros(UTCMinutes));
  return time
}

function leadingZeros(digit) {
  if(digit<10) {
    return "0"+digit
  }else {return digit}
}
