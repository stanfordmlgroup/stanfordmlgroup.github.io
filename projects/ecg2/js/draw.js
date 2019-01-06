(function ($) {
  'use strict'
  function randomIntFromInterval (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  // Create a data point generator.
  var DataPointGenerate = function (mask_answer) {
    var data = window.data.data
    var labelStrings = window.data.labels
    var _sequence_index, _data, _labels
    var _sample_index = 0
    var _max = data[0].x.length
    var _xyz

    var get_xyz = function (sequence_index, sample_index) {
      var _data = data[sequence_index].x
      var _labels = data[sequence_index].y

      var xyz =  {
        x: Date.now(),
        y: _data[sample_index],
        z: _labels[sample_index]
      }
      xyz.label = mask_answer ? '' : labelStrings[xyz.z]
      return xyz
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
          if (num_tries === (data.length * 10)) break
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
  }

  var num_charts = 4
  var generators = []
  var labels = [7, 6, 1, 4]

  for (var i = 0; i < num_charts; i++) {
    var gen = DataPointGenerate(i === 0) // mask the first one
    generators.push(gen)
    $('#ecg'+ i).ecgChart()
  }

  var interval = 1 / 200 // sampling frequency
  var alternate = true
  setInterval(function () {
    for (var i =  0; i < num_charts; i++) {
      $('#ecg' + i).ecgChart(
        'addDataPoint',
        generators[i](labels[i]))
    }
  }, interval)
})($)
