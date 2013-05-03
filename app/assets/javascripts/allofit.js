$(document).ready(function () {

  $('form').on('submit', function(e){
    e.preventDefault();
    var start_location = $("input[name=start_location]").val();
    var end_location = $("input[name=end_location]").val();

    // var end_location   ="market and beale st, san francisco";
    // var start_location ="market and 6th st, san francisco";
    var departure_time = Math.round(new Date().getTime()/1000);
    var arrival_time = (Math.round(new Date().getTime()/1000)) + 3600;
    $.get("https://maps.googleapis.com/maps/api/directions/json?alternatives=true&origin=" + start_location + "&destination=" + end_location + "&sensor=false&arrival_time=" + arrival_time + "&mode=transit", function(data){
      $.each(data.routes, function(i,v){ 
        var legs = v.legs[0]
        var steps = legs.steps
        $.each(steps, function(i, step) { 
          if (step.travel_mode == "TRANSIT") {
            var travel_time = step.duration.value;
            var start_latitude = roundNumber(step.start_location.lat, 5);
            var start_longitude = roundNumber(step.start_location.lng, 5);
            var agency = step.transit_details.line.agencies[0].name;
            var direction = step.transit_details.headsign;
            var start_stop_name = step.transit_details.departure_stop.name;
            var end_stop_name = step.transit_details.arrival_stop.name;
            var end_latitude = step.end_location.lat;
            var end_longitude = step.end_location.lng;
            var line_name = step.transit_details.line.name;
            var line_short_name = step.transit_details.line.short_name;

            $('#whatever').html("G API " + agency + " lat " + start_latitude + " long " + start_longitude + " line short name " + line_short_name + " starting station " + start_stop_name);

            var getStopTagURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=";
            var getPredictionsURL = "http://webservices.nextbus.com/service/publicXMLFeed?command=predictions&a=sf-muni&r=";

            if (agency == "San Francisco Municipal Transportation Agency") {
              $.ajax({
                url: getStopTagURL + line_short_name
              }).done(function(xml) {
                var stops = xml.getElementsByTagName('stop');
                for (var i = 0; i < stops.length; i++) {
                  if (stops[i].attributes.length > 1) {
                    var roundedLatitude = roundNumber((stops[i].attributes[2].nodeValue), 5);
                    var roundedLongitude = roundNumber((stops[i].attributes[3].nodeValue), 5);

                    if ((roundedLatitude == start_latitude) &&
                      (roundedLongitude == start_longitude)) {
                      stopTagName = (stops[i].attributes[0].nodeValue);
                      $.ajax({
                        url: getPredictionsURL + line_short_name + "&s=" + stopTagName
                      }).done(function(predictionXML) {
                        predictionTime = [];
                        predictions = predictionXML.getElementsByTagName('prediction');
                        for (var i = 0; i < predictions.length; i++) {
                          predictionTime.push(predictions[i].attributes[1].nodeValue);
                          $('#whatever').append("<br>SFMTA " + (parseFloat(predictionTime[i])/60) + "<br>");
                        };
                      });
                    };
                  }
                };
              });
            } else if (agency == "Bay Area Rapid Transit"){
              console.log("BART!!")
            }
          }
        });
      });
    });
  });

});

function roundNumber(number,decimal_points) {
  if(!decimal_points) return Math.round(number);
  if(number == 0) {
    var decimals = "";
    for(var i=0;i<decimal_points;i++) decimals += "0";
    return "0."+decimals;
  }

  var exponent = Math.pow(10,decimal_points);
  var num = Math.round((number * exponent)).toString();
  return num.slice(0,-1*decimal_points) + "." + num.slice(-1*decimal_points)
}
