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
  

  $(".home-nav").on("click", function(e) {
    e.preventDefault();
    location.reload();
  });

  // setTimeout(function() {populateRouteInfo()},6000);

  $("#fetch").on("click", function(){
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
      $("a.go").click();
    }
  });

  // $("a .go").mouseenter(function() {
  //   $("#gounclick").addClass("hidden");
  //   $("#goclick").removeClass("hidden");
  // }).mouseleave(function() {
  //   $("#goclick").addClass("hidden");
  //   $("#gounclick").removeClass("hidden");
  // });
  // .mouseleave(function() {
  //   $(this).toggleClass("hidden");
  // });

});
