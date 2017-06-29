(function ($) {
  'use strict'
  function randomIntFromInterval (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  var index = randomIntFromInterval(0, window.data.data.length - 1)
  var _data = window.data.data[index].x
  var _labels = window.data.data[index].y
    // Create a data point generator.
  var getDataPoint = (function () {
    var _x = -1
    var _max = _data.length

    return function () {
      _x = (_x + 1) % _max
      return { x: Date.now(), y: _data[_x], z: _labels[_x]}
    }
  })()

  $('.ecgChart').ecgChart()

  var interval = 1 / 200 // sampling frequency
  setInterval(function () {
    $('.ecgChart').ecgChart('addDataPoint', getDataPoint())
  }, interval)
})($)
