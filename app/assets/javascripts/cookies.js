function saveHistory() {
  var dest = $('input#end_location').val()
  var buffer = $('input#buffer_time').val()
  $.post('/', {destination: dest, buffer: buffer} )
}