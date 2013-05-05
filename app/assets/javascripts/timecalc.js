var leg = {
  departureSeconds: "400",
  walkTime: 242,
  leaveInXSeconds: function() { return secondsToLeaveIn(this.departureSeconds, this.walkTime); },
  leaveAtTimes: function() { return leaveAtTimes(this.departureSeconds, this.walkTime); }
}

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

