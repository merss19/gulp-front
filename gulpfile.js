// Инициализируем плагины
var gulp = require('gulp'),
	jade = require('gulp-jade'),
	stylus = require('gulp-stylus'),
	autoprefixer = require('gulp-autoprefixer'),
	imagemin = require('gulp-imagemin'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	cssbeautify = require('gulp-cssbeautify'),
	gutil = require('gulp-util'),
	cache = require('gulp-cache'),
	include = require('gulp-include'),
	rename = require("gulp-rename"),
	uglify = require('gulp-uglify');

// Функция обработки ошибок
handleError = function(err) {
	gutil.log(err);
	gutil.beep();
};

// Пути к файлам
path = {
	html: {
		source: ['./source/**/*.jade', '!./source/partials/*.jade', '!./source/blocks/**/*.jade'],
		watch: 'source/**/*.jade',
		destination: './public/',
		basedir: './source'
	},
	css: {
		source: ['./source/css/*.styl', '!./source/css/lib/**/*.styl', '!./source/**/_*.styl'],
		watch: 'source/**/*.styl',
		destination: './public/css/'
	},
	assets: {
		source: './assets/**/*',
		watch: 'assets/**/*',
		destination: './public'
	},
	img: {
		source: './source/img/**/*.{jpg,jpeg,png,gif,svg}',
		watch: 'source/img/**/*',
		destination: './public/img'
	},
	js: {
		plugins: {
			source: './source/js/*.js',
			watch: './source/js/*',
			destination: './public/js'
		}
	}
};


// Локальный сервер
gulp.task('webserver', function() {
	browserSync({
		server: {
			baseDir: "./public"
		}
	});
});


// Собираем Stylus
gulp.task('stylus', function() {
	gulp.src(path.css.source)
		.pipe(stylus())
		.pipe(autoprefixer({
			browsers: ['last 2 version', '> 5%', 'safari 5', 'ie 8', 'ie 7', 'opera 12.1', 'ios 6', 'android 4'],
			cascade: false
		}))
		.pipe(cssbeautify({
			indent: '	',
			autosemicolon: true
		}))
		.on('error', handleError)
		.pipe(gulp.dest(path.css.destination))
		.pipe(reload({stream:true}));
});

// Собираем html из Jade
gulp.task('jade', function() {
	gulp.src(path.html.source)
		.pipe(jade({
			pretty: '\t',
			basedir: path.html.basedir
		}))
		.on('error', handleError)
		.pipe(gulp.dest(path.html.destination))
		.pipe(reload({stream:true}));
});

// Копируем и минимизируем изображения
gulp.task('images', function() {
	gulp.src(path.img.source)
		.pipe(cache(imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		})))
		.on('error', handleError)
		.pipe(gulp.dest(path.img.destination));
});

// Копируем файлы
gulp.task('copy', function() {
	gulp.src(path.assets.source)
		.on('error', handleError)
		.pipe(gulp.dest(path.assets.destination))
		.pipe(reload({stream:true}));
});

// Собираем JS
gulp.task('plugins', function() {
	gulp.src(path.js.plugins.source)
		.pipe(include())
		.pipe(gulp.dest(path.js.plugins.destination))
		.pipe(uglify())
		.pipe(rename({
			suffix: ".min"
		}))
		.on('error', handleError)
		.pipe(gulp.dest(path.js.plugins.destination))
		.pipe(reload({stream:true}));
});


gulp.task("build", ['stylus', 'jade', 'images', 'plugins', 'copy']);

gulp.task("default", ["build", "webserver"], function(){
	gulp.watch(path.css.watch, ["stylus"]);
	gulp.watch(path.html.watch, ["jade"]);
	gulp.watch(path.img.watch, ["images"]);
	gulp.watch(path.js.plugins.watch, ["plugins"]);
	gulp.watch(path.assets.watch, ["copy"]);
});
