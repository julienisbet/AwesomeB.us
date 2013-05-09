function validateForm() {
  var x = $("#start_location").val();
  var y = $("#end_location").val();
  if ( x == null || x == "" || y == null || y == "" )
    { addError("Please enter both start and end destination"); return false;
  } else { 
    return true 
    //if start lcoation is current location && coordinates not populated, pop up "something went wrong"
  }

}
