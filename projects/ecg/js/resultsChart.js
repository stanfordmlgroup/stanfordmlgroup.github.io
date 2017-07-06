(function (google, $) {
  google.charts.load('current', {'packages': ['bar']})
  google.charts.setOnLoadCallback(drawChart)

  function drawChart () {
    var data = google.visualization.arrayToDataTable([
      ['Metric', 'Model', 'Cardiologist'],
      ['Sequence F1', 0.776, 0.719],
      ['Set F1', 0.809, 0.751]
    ])

    var options = {
      chart: {},
      bars: 'horizontal', // Required for Material Bar Charts.
      bar: { groupWidth: '50%' },
      hAxes: [{title: 'Score', viewWindow: {min: 0.5, max: 0.85}}],
      height: $('#resultsChart').width() / 2,
      legend: {position: 'left'},
      colors: ['#cfe2f3', '#fff1cc']
    }
    var chart = new google.charts.Bar(document.getElementById('resultsChart'))
    chart.draw(data, google.charts.Bar.convertOptions(options))
  }
})(google, $)
