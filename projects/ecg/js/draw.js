(function ($) {
  'use strict'
  function randomIntFromInterval (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  // Create a data point generator.
  var getDataPoint = (function () {
    var index, _data, _labels
    var _x = -1
    var _max = window.data.data[0].x.length

    return function () {
      _x = (_x + 1) % _max
      if (_x === 0) {
        index = randomIntFromInterval(0, window.data.data.length - 1)
        _data = window.data.data[index].x
        _labels = window.data.data[index].y
      }
      return {x: Date.now(), y: _data[_x], z: _labels[_x]}
    }
  })()

  $('.ecgChart').ecgChart()

  var interval = 1 / 200 // sampling frequency
  setInterval(function () {
    $('.ecgChart').ecgChart('addDataPoint', getDataPoint())
  }, interval)
})($)
