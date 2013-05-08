function validateForm() {
  var x = $("#start_location").val();
  var y = $("#end_location").val();
  if ( x == null || x == "" || y == null || y == "" )
    { alert("Both fields must be filled out"); return false;
  } else { return true }
}