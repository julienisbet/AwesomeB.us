var leg = {
  departureSeconds: ["400", "800", "1200"],
  walkTime: "242",
  leaveInXSeconds: function() { return secondsToLeaveIn(this.departureSeconds, this.walkTime); },
  leaveAtTimes: function() { return leaveAtTimes(this.departureSeconds, this.walkTime); }
}

function secondsToLeaveIn(departureSeconds, walkTime) {
  var leaveSeconds = [];
  for(var i = 0; i < departureSeconds.length; i++) {
    leaveSeconds.push(departureSeconds[i] - walkTime);
  }
  return leaveSeconds;
}

function leaveAtTimes(departureSeconds, walkTime) {
  var leaveTimes = [];
  var nowInEpochSeconds = Math.round(new Date()/1000.0);
  $.each(departureSeconds, function(index, value) {
    var leaveInEpochSeconds = nowInEpochSeconds + parseInt(value - walkTime);
    var date = new Date(leaveInEpochSeconds * 1000);
    var UTCHours = date.getUTCHours();
    if (UTCHours <= 12) {
      var hours = (UTCHours - 7);
    } else {
      var hours = (UTCHours - 19);
    }
    var UTCMinutes = date.getUTCMinutes();
    var UTCSeconds = date.getUTCSeconds();
    var time = (hours + " : " + UTCMinutes + " : " + UTCSeconds);
    leaveTimes.push(time);
  })
  return leaveTimes
}

console.log(leg.leaveAtTimes());
console.log(leg.leaveInXSeconds());