$(document).ready(function () {

  $('form').on('submit', function(e){
    e.preventDefault();
    var start_location = $("input[name=start_location]").val();
    var end_location = $("input[name=end_location]").val();
    var departure_time = Math.round(new Date().getTime()/1000);
    // var arrival_time = $("input[name=arrival_time]").val();
    $.get("https://maps.googleapis.com/maps/api/directions/json?origin=" + start_location + "&destination=" + end_location + "&sensor=false&departure_time=" + departure_time + "&mode=transit", function(data){
      var d = data;
      var routes = d.routes[0]
      var legs = routes.legs[0]
      var steps = legs.steps
      $.each(steps, function(i, step) { 
        if (step.travel_mode == "TRANSIT") {
          var travel_time = step.duration.value;
          var start_latitude = step.start_location.lat;
          var start_longitude = step.start_location.lng;
          var agency = step.transit_details.line.agencies[0].name;
          var direction = step.transit_details.headsign;
          var start_stop_name = step.transit_details.departure_stop.name;
          var end_stop_name = step.transit_details.arrival_stop.name;
          var end_latitude = step.end_location.lat;
          var end_longitude = step.end_location.lng;
          var line_name = step.transit_details.line.name;
          var line_short_name = step.transit_details.line.short_name;
          $('#whatever').html(agency);
        }
      });
    });
  });

});
