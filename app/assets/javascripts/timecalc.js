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

function convertSecondsToRegularTime(seconds) {
  var date = new Date(seconds * 1000);
  var UTCHours = date.getUTCHours();
  var hours = ((UTCHours - 7) + 12) % 12;
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
