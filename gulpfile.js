var gulp = require('gulp')
var pug = require('gulp-pug')
var watch = require('gulp-watch')
var data = require('gulp-data')
var browserSync = require('browser-sync').create()

var rankEntries = function (entries) {
  entries.sort(function (a, b) {
    var kappaDiff = Math.sign(b.kappa - a.kappa)
    return kappaDiff
  })

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i]
    if (i === 0) {
      entry.rank = 1
    } else {
      var prevEntry = entries[i - 1]
      var rank = prevEntry.rank
      if (entry.kappa < prevEntry.kappa) rank++
      entry.rank = rank
    }
  }
  return entries
}

function assert (condition, message) {
  if (!condition) {
    throw message || 'Assertion failed'
  }
}

var parseCompEntries = function (comp_file, comp_name) {
  var leaderboard = require(comp_file).leaderboard
  var entries = []

  for (var i = 0; i < leaderboard.length; i++) {
    try {
      var o_entry = leaderboard[i]
      var entry = {}
      entry.user = o_entry.submission.user_name
      var description = o_entry.submission.description.trim()
      entry.model_name = description.substr(0, description.lastIndexOf('(')).trim()
      var firstPart = description.substr(description.lastIndexOf('(') + 1)
      entry.institution = firstPart.substr(0, firstPart.lastIndexOf(')'))
      if (description.lastIndexOf('http') !== -1) {
        entry.link = description.substr(description.lastIndexOf('http')).trim()
      }
      entry.date = o_entry.submission.created
      if (comp_name === 'mrnet') {
        entry.average = parseFloat(o_entry.scores.average_auroc)
        if (!(entry.average >= 0)) throw 'Score invalid'
        if (entry.average < 0.5) throw 'Score too low'
        entry.abnormal = parseFloat(o_entry.scores.abnormal_auroc)
        entry.acl = parseFloat(o_entry.scores.acl_auroc)
        entry.meniscus = parseFloat(o_entry.scores.meniscus_auroc)
      } else if (comp_name === 'mura'){
        entry.kappa = parseFloat(o_entry.scores.overall_mean)
        if (!(entry.kappa >= 0)) throw 'Score invalid'
        if (entry.kappa < 0.5) throw 'Score too low'
      } else if (comp_name === 'chexpert'){
        entry.auc = parseFloat(o_entry.scores.average_auroc)
        entry.average_num_rads_under_roc = parseFloat(o_entry.scores.average_num_rads_under_roc)
        if (!(entry.auc >= 0)) throw 'Score invalid'
        if (entry.auc < 0.7) throw 'Score too low'
      }
      if (entry.model_name === '') {
        entry.model_name = '' + entry.user
      }
      entries.push(entry)
    } catch (err) {
      console.error(err)
      console.error(entry)
    }
  }
  entries = rankEntries(entries)
  return entries
}

var comps = ["mura", "chexpert", "mrnet"]
comps.forEach(function (comp) {
  var dir = './competitions/' + comp
  gulp.task('process_' + comp + '_comp_output', function (cb) { //'competitions-'+comp, function(cb) {
    var jsonfile = require('jsonfile')
    var entries = parseCompEntries(dir + '/out.json', comp)
    jsonfile.writeFile(dir + '/results.json', entries, cb)
  })
})

gulp.task('index', function () {
  return gulp.src('views/index.pug')
    .pipe(pug({locals: {index: true}}))
    .pipe(gulp.dest('.'))
})

var folders = ['projects', 'programs', 'people', 'competitions']

folders.forEach(function (folder) {
  if(folder === ('competitions')){
    comps.forEach(function (comp) {
      var dir = './competitions/' + comp
      gulp.task(folder + '-' + comp, ['process_' + comp + '_comp_output'], function () {
        var test = require(dir + '/results.json')
        var moment = require('moment')
        return gulp.src('views/' + dir + '/*.pug')
        .pipe(data(function () {
          return {
            'test': test,
            'moment': moment}
        }))
        .pipe(pug())
        .pipe(gulp.dest(dir))
      })
    })
  } else {
    gulp.task(folder, function buildHTML () {
      return gulp.src('views/' + folder + '/**/*.pug')
      .pipe(pug({}))
      .pipe(gulp.dest('./' + folder))
    })
  }
})

gulp.task('build', ['index', 'projects', 'programs', 'people', 'competitions-mura', 'competitions-chexpert', 'competitions-mrnet'])

gulp.task('watch_build', ['build'], function () {
  return gulp.watch('./views/**/*.pug', ['build', browserSync.reload])
})

gulp.task('browser-sync', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
})

gulp.task('default', ['browser-sync', 'watch_build'])
