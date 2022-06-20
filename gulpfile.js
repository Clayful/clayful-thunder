"use strict";

const Path         = require('path');
const fs           = require('fs');
const mergeStream  = require('merge-stream');
const glob         = require('glob');
const gulp         = require('gulp');
const rename       = require('gulp-rename');
const replace      = require('gulp-replace');
const concat       = require('gulp-concat');
const dotify       = require('gulp-dotify');
const browserify   = require('browserify');
const babelify     = require('babelify');
const watchify     = require('watchify');
const uglify       = require('gulp-uglify');
const sass         = require('gulp-sass')(require('sass'));
const csso         = require('gulp-csso');
const autoprefixer = require('gulp-autoprefixer');
const source       = require('vinyl-source-stream');
const buffer       = require('vinyl-buffer');
const notify       = require('gulp-notify');
const clean        = require('gulp-clean');

const app       = './app';
const locales   = 'locales/*.js';
const style     = Path.join(app, 'style.scss');
const styles    = Path.join(app, '**/*.scss');
const templates = Path.join(app, 'modules/*/*.dot');
const plugins   = './plugins/**';

fs.writeFileSync(`./app/version.json`, `"${require('./package.json').version}"`, 'utf8');

gulp.task('thunder', () => {

	return watchify(browserify({
				entries:   ['./app/index.js'],
				debug:     true,
				sourceMap: false
			}))
			.transform(babelify, require('./babel.config.js')())
			.transform({
				global: true
			}, 'browserify-shim')
			.bundle()
			.on('error', function(err) {
				console.log(err.message);
				this.emit('end');
			})
			.pipe(source('thunder.js'))
			.pipe(buffer())
			.pipe(gulp.dest('dist'))
			.pipe(uglify())
			.pipe(rename({
				basename: 'thunder.min'
			}))
			.pipe(gulp.dest('dist'))
			.pipe(notify('Thunder scripts are compiled'));
});

gulp.task('plugins', done => {

  
  glob('./plugins/**/*.js', (err, files) => {
    
    if (err) return done(err);
    
    const ms = mergeStream();
		const tasks = files.reduce((ms, entry) => {

			ms.add(watchify(browserify({
          entries:   [entry],
          debug:     true,
          sourceMap: false
        }))
        .transform(babelify, {})
        .bundle()
        .pipe(source(entry))
        .pipe(buffer())
        .pipe(gulp.dest('dist'))
        .pipe(uglify())
        .pipe(rename({
          suffix: '.min'
        }))
        .pipe(gulp.dest('dist'))
      )

      return ms;

		}, ms);

    return tasks

	});

});

gulp.task('locales', () => {

	return gulp.src(locales)
			.pipe(gulp.dest('dist/locales'));

});

gulp.task('templates', () => {

	return gulp.src(templates)
			.pipe(dotify({
				root:       'modules',
				extension:  '.dot',
				dictionary: 'window.Thunder.components'
			}))
			.pipe(replace(
				/(\.components\["[^"]+"\])/,
				'$1.template'
			))
			.pipe(replace(
				/^(window\.Thunder\.components\[\"[\w-]+)-template(\"\])/,
				'$1$2'
			))
			.pipe(uglify())
			.pipe(rename(path => {
				path.basename = path.dirname;
				path.dirname = '';
				path.extname = '.js';
			}))
			.pipe(gulp.dest('dist/theme/basic/templates'))
			.pipe(concat('templates.min.js'))
			.pipe(gulp.dest('dist/theme/basic'));

});

gulp.task('style', () => {

	return gulp.src(style)
			.pipe(sass().on('error', sass.logError))
			.pipe(autoprefixer())
			.pipe(rename({
				basename: 'style'
			}))
			.pipe(replace(`background-image: url(../img/controls.png);`, ``))
			.pipe(gulp.dest('dist/theme/basic'))
			.pipe(csso())
			.pipe(rename({
				basename: 'style.min'
			}))
			.pipe(gulp.dest('dist/theme/basic'))
			.pipe(notify('Thunder styles are compiled'));

});

gulp.task('watch', () => {

	gulp.watch(['./app/**/*.js'], ['thunder']);
	gulp.watch(locales,           ['locales']);
	gulp.watch(templates,         ['templates']);
	gulp.watch(styles,            ['style']);
	gulp.watch(plugins,           ['plugins']);

});

gulp.task('clean', () => {

	return gulp.src('dist', { read: false })
		.pipe(clean());

});

gulp.task('build', gulp.series(
	'clean',
	[
		'thunder',
		'locales',
		'templates',
		'style',
		'plugins',
	]
));

gulp.task('default', gulp.series(
	'build',
	'watch'
));