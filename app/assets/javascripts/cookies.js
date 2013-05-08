function saveHistory() {
  var dest = $('input#end_location').val()
  $.post('/', {destination: dest} )
}
