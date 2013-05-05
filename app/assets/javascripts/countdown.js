var timer;
var totalSeconds;

function CreateTimer(timerID, time) {
  timer = document.getElementById(timerID);
  totalSeconds = time;

  UpdateTimer();
  window.setTimeout("Tick()", 1000);
}

function Tick() {
  if (totalSeconds <= 0) {
    alert("GTFO!");
    return;
  }
  totalSeconds -= 1;
  UpdateTimer();
  window.setTimeout("Tick()", 1000);
}

function UpdateTimer() {
  var seconds = totalSeconds;
  var minutes = Math.floor(seconds / 60);
  var timeStr = (LeadingZero(minutes) + " : " + LeadingZero(seconds));
  timer.innerHTML = timeStr;
}

function LeadingZero(time) {
  return (time < 10) ? "0" + time : + time;
}
