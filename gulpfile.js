﻿const gulp = require('gulp');
﻿const gutil = require('gulp-util');
const autoprefixer = require('autoprefixer');
const postcssInlineSvg = require('postcss-inline-svg');
const postcssSorting = require('postcss-sorting');
const perfectionist = require('perfectionist');
const plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

const config = {
    styles: {
        cacheKey: 'sass',
        src: 'src/styles/**/[a-zA-Z0-9]*.{scss, sass}',
        destFile: 'styles.css'
    },
    js: {
        cacheKey: 'js',
        src: 'src/js/**/*.js',
        destFile: 'script.js'
    },
    img: {
        src: 'src/styles/img/**/*.png',
        destFile: 'sprite.png'
    },
    contentImg: {
        src: 'content/img/**/*.png'
    },
    dest: 'dist'
};

const errorHandler = () => {
    const notifier = plugins.notify.onError({
        title: 'Error: \'sass:build\' failed.',
        message: 'Error: <%= error.message %>'
    });

    return error => {
        notifier(error);
        gutil.log(error);
        this.emit('end');
    };
};

// Styles

gulp.task('sass:build', () => (
    gulp.src(config.styles.src, { base: './' })
        .pipe(plugins.plumber({ errorHandler: errorHandler() }))
        .pipe(plugins.sass({ sourcemap: true }))
        .pipe(plugins.sourcemaps.init({ loadMaps: true }))
        .pipe(plugins.postcss([
                autoprefixer({ browsers: ['last 5 versions', 'ie >= 9'] }),
                postcssInlineSvg()
            ]))
        .pipe(plugins.csso({ sourceMap: true }))
        .pipe(plugins.concat(config.styles.destFile))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(config.dest))
));

gulp.task('sass:deploy', () => (
    gulp.src(config.styles.src, { base: './' })
        .pipe(plugins.sass())
        .pipe(plugins.postcss([
                autoprefixer({ browsers: ['last 5 versions', 'ie >= 9'] }),
                postcssInlineSvg()
            ]))
        .pipe(plugins.csso())
        .pipe(plugins.concat(config.styles.destFile))
        .pipe(gulp.dest(config.dest))
));

gulp.task('sass:comb', () => (
    gulp.src(config.styles.src, { base: './' })
        .pipe(plugins.postcss([
                autoprefixer({ add: false, browsers: [] }),
                perfectionist({
                    cascade: true,
                    colorCase: 'lower',
                    colorShorthand: true,
                    format: 'expanded',
                    indentSize: 4,
                    maxAtRuleLength: 80,
                    maxSelectorLength: 4,
                    maxValueLength: 80,
                    trimLeadingZero: true,
                    trimTrailingZeros: true,
                    sourcemap: false,
                    zeroLengthNoUnit: true,
                    syntax: 'scss'
                }),
                postcssSorting({
                    'sort-order': require('./csscomb.json')['sort-order'],
                    'empty-lines-between-children-rules': 1
                })
            ], { syntax: require('postcss-scss') }))
        .pipe(gulp.dest(''))
));

// Javascript

gulp.task('js:build', () => (
    gulp.src(config.js.src, { base: './' })
        .pipe(plugins.sourcemaps.init({ loadMaps: true }))
        .pipe(plugins.concat(config.js.destFile))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest(config.dest))
));

gulp.task('js:deploy', () => (
    gulp.src(config.js.src, { base: './' })
        .pipe(plugins.uglify())
        .pipe(plugins.concat(config.js.destFile))
        .pipe(gulp.dest(config.dest))
));

// Images and files

gulp.task('img:optimize', () => (
    gulp.src(config.img.src, { base: './' })
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(''))
));

gulp.task('contentImg:optimize', () => (
    gulp.src(config.contentImg.src, { base: './' })
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(''))
));

gulp.task('img:copy', () => (
    gulp.src('./src/styles/img/*.*')
        .pipe(gulp.dest('./dist/img'))
));

gulp.task('img:sprite', () => {
        /*
        const fs = require('fs');
        const postcss = require('postcss');
        const sprites = require('postcss-sprites').default;

        const css = fs.readFileSync('./dist/styles.css', 'utf8');
        const opts = {
        stylesheetPath: './dist',
        spritePath: './dist'
    };

    postcss([sprites(opts)])
        .process(css, {
            from: './dist/styles.css',
            to: './dist/styles.css'
        })
        .then(result => {
            fs.writeFileSync('./dist/styles.css', result.css);
        });
        */
});

gulp.task('fonts:copy', () => (
    gulp.src('./src/styles/fonts/*.ttf')
        .pipe(gulp.dest('./dist/fonts'))
));

// Common

gulp.task('watch', () => {
    gulp.watch(config.styles.src, ['sass:build']);

    gulp.watch(config.styles.src, ['js:build']);
});
