module.exports = function(gulp, plugins) {
    gulp.task('deploy', [], function() {
        return plugins.surge({
            project: './build',         // Path to your static build directory
            domain: 'datumipsum.com'  // Your domain or Surge subdomain
        });
    });
};
