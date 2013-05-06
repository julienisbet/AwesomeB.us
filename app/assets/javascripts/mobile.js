$(document).ready(function(){

  $("form #start_loc").focus(function (e) {
    if ($(this).val() == "Current Location") {
      $(this).val("");
    }
  })

  $("form #start_loc").focusout(function (e) { 
    if ($(this).val() == "") {
      $(this).val("Current Location");
    }
  })
  
  $("a .go").on("click", function (e) {
    e.preventDefault();
    $("form").fadeOut(function(){
      $("#fetch").fadeIn();
      // $("form #start_loc").val("Fetching Routes...");
      // $(".current-route").fadeIn("slow");
      $(".fetch-bar").fadeIn("slow");
      $(".circle").fadeIn("slow");
    });
    $(".center-div").children().toggleClass("hidden");
    // $(".center-div img").toggleClass('hidden');
    // $(".center-div#submit").toggleClass('hidden');
  });

  $(".home-nav").on("click", function(e) {
    e.preventDefault();
    location.reload();
  });

  setTimeout(function() {populateRouteInfo()},6000);



});

   // <li><input type="text" readonly="readonly" id="fetch" class="route" value="Route..."></li>
   //  <li><input type="text" readonly="readonly" id="fetch" class="leave" value="Leave At..."></li>
   //  <li><input type="text" readonly="readonly" id="fetch" class="arrive" value="Arrive At...">
