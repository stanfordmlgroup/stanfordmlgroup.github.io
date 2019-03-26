var $form = $('form#test-form'),
    url = 'https://script.google.com/macros/s/AKfycbyBd9gwSTK2C8PJIwBBIWTz9AQV4l5G8OXG2DPdRcdfDxz2mXw/exec'

$('#submit-form').on('click', function(e) {
  e.preventDefault();
  var jqxhr = $.ajax({
    url: url,
    method: "GET",
    dataType: "json",
    data: $form.serializeObject()
  }).success(
    // hope the server sets Content-Disposition: attachment!
    window.location = 'https://cs.stanford.edu/group/mlgroup/mrnet-v1.0.zip';
  );
})