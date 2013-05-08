$(document).ready(function(){

  // drawTimer("center-div","green","GO",60);

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
    $(".center-div").children().hide();
    // $(".center-div img").toggleClass('hidden');
    // $(".center-div#submit").toggleClass('hidden');
  });

  $(".home-nav").on("click", function(e) {
    e.preventDefault();
    location.reload();
  });

  // setTimeout(function() {populateRouteInfo()},6000);

  $(".dropdown").on("click", function(){
    if ($(".dropdownlist:hidden").length) {
      $(".dropdownlist").show();
    } else {
      $(".dropdownlist").hide();
    }
  });

  $(".homenav").mousemove(function(e){
    console.log("wha?")
    $(".homenav").css({left:e.pageX, top:e.pageY});
  });

  $("input").keypress(function() {
    if (event.which == 13) {
      $("a .go").click();
    }
  });

  $("a .go").mouseenter(function() {
    $("#gounclick").addClass("hidden");
    $("#goclick").removeClass("hidden");
  }).mouseleave(function() {
    $("#goclick").addClass("hidden");
    $("#gounclick").removeClass("hidden");
  });
  // .mouseleave(function() {
  //   $(this).toggleClass("hidden");
  // });

});
