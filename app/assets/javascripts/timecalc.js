function secondsToLeaveIn(departureSeconds, walkTime) {
  return (parseInt(departureSeconds) - walkTime);
}

function leaveAtTimes(departureSeconds, walkTime) {
  var nowInEpochSeconds = Math.round(new Date()/1000.0);
  var leaveInEpochSeconds = nowInEpochSeconds + parseInt(departureSeconds - walkTime);
  var date = new Date(leaveInEpochSeconds * 1000);
  var UTCHours = date.getUTCHours();
  var hours = ((UTCHours - 7) + 12) % 12;
  var UTCMinutes = date.getUTCMinutes();
  var UTCSeconds = date.getUTCSeconds();
  var time = (hours + " : " + UTCMinutes + " : " + UTCSeconds);
  return time
}

console.log(leg.leaveAtTimes());
console.log(leg.leaveInXSeconds());

