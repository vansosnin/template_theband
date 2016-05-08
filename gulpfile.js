const gulp = require('gulp');
const autoprefixer = require('autoprefixer');
const postcssScss = require('postcss-scss');
const postcssSorting = require('postcss-sorting');
const perfectionist = require('perfectionist');
const plugins = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

const config = {
    styles: {
        cacheKey: 'sass',
        src: 'src/styles/**/*.{scss, sass}',
        destFile: 'styles.css'
    },
    js: {
        cacheKey: 'js',
        src: 'src/js/**/*.js',
        destFile: 'script.js'
    },
    dest: 'dest'
};

// Styles

gulp.task('sass:build', () => (
    gulp.src(config.styles.src, { base: './' })
        .pipe(plugins.cached(config.styles.cacheKey, { optimizeMemory: true }))
        .pipe(plugins.sass({ sourcemap: true }))
        .pipe(plugins.sourcemaps.init({ loadMaps: true }))
        .pipe(plugins.postcss([
                autoprefixer({ browsers: ['last 5 versions', 'ie >= 9'] })
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
                autoprefixer({
                    browsers: ['last 5 versions', 'ie >= 9']
                })
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
                    format: 'expanded',
                    indentSize: 4,
                    maxAtRuleLength: 80,
                    maxSelectorLength: 5,
                    maxValueLength: 80,
                    sourcemap: false,
                    syntax: 'scss'
                }),
                postcssSorting({
                    'sort-order': require('./csscomb.json')['sort-order'],
                    'empty-lines-between-children-rules': 1
                })
            ], { syntax: postcssScss }))
        .pipe(gulp.dest(''))
));

// Javascript

gulp.task('js:build', () => (
    gulp.src(config.js.src, { base: './' })
        .pipe(plugins.cached(config.js.cacheKey, { optimizeMemory: true }))
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

// Common

gulp.task('deploy', ['sass:deploy', 'js:deploy']);

gulp.task('watch', () => {
    gulp.watch(config.styles.src, ['sass:build'], evt => {
        if (evt.type === 'deleted') {
            delete plugins.cached.caches[config.styles.cacheKey][evt.path];
        }
    });

    gulp.watch(config.styles.src, ['js:build'], evt => {
        if (evt.type === 'deleted') {
            delete plugins.cached.caches[config.js.cacheKey][evt.path];
        }
    });
});
