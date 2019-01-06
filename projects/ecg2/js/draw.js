(function ($) {
  'use strict'
  function randomIntFromInterval (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  // Create a data point generator.
  var getDataPoint = (function () {
    var data = window.data.data
    var _sequence_index, _data, _labels
    var _sample_index = 0
    var _max = data[0].x.length
    var _xyz

    var get_xyz = function (sequence_index, sample_index) {
      _data = data[sequence_index].x
      _labels = data[sequence_index].y
      return {
        x: Date.now(),
        y: _data[sample_index],
        z: _labels[sample_index]
      }
    }

    var get_sequence_sample_index = function (random, searchFor) {
      var sample_index = 0
      var sequence_index = 0

      if (random === true) {
        // get a random sequence
        sequence_index = randomIntFromInterval(0, data.length - 1)
      } else {
        var num_tries = 0
        while (true) {
          if (num_tries === (data.length * 2)) break
          num_tries++
          sequence_index = randomIntFromInterval(0, data.length - 1)
          sample_index = data[sequence_index].y.indexOf(searchFor)
          if (sample_index !== -1) break
        }
      }
      return {
        sequence_index: sequence_index,
        sample_index: sample_index
      }
    }

    return function (rhythm_index) {
      // get a sequence index and sample index
      // searching for a rhythm index
      if (_sample_index === 0 || _xyz.z !== rhythm_index) {
        var indices = get_sequence_sample_index(false, rhythm_index)
        _sample_index = indices.sample_index
        _sequence_index = indices.sequence_index
      }
      _xyz = get_xyz(_sequence_index, _sample_index)
      _sample_index = (_sample_index + 1) % _max

      return _xyz
    }
  })()

  $('.ecgChart').ecgChart()

  var interval = 1 / 200 // sampling frequency
  setInterval(function () {
    $('.ecgChart').ecgChart('addDataPoint', getDataPoint(10))
  }, interval)
})($)
