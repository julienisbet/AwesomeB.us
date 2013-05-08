function saveHistory() {
  var dest = $('input#end_location').val()
  $.post('/', {destination: dest} )
  console.log('hey we got this far  ')
  console.log(dest)
}
