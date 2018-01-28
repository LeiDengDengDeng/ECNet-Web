let gulp = require('gulp'),
    connect = require('gulp-connect'),
    webpack = require('webpack');

gulp.task('webpack', () => {
    webpack(require('./webpack.config'), () => {
        connect.reload();
    });
});

gulp.task('watch', () => {
    gulp.watch(['src/**/*.js', 'src/**/*.css', 'src/*.js'], ['webpack']);
    gulp.watch(['dist/*.js', './*.html'], ['reload']);
});

gulp.task('reload', () => {
    gulp.src('dist/*.js').pipe(connect.reload());
});

gulp.task('connect', () => {
    connect.server({
        root: './',
        livereload: true,
    });
});

gulp.task('default', ['connect', 'webpack', 'watch']);
