module.exports = function (grunt) {
    var files = [
        './platypus-docs/**/*.ts',
        './platypus-docs/!(typings)/*.ts'
    ];

    grunt.initConfig({
        typescript: {
            options: {
                module: 'commonjs',
                target: 'es5'
            },
            compile: {
                src: files
            }
        },
        shell: {
            tsd: {
                command: 'node node_modules/tsd/build/cli update -so --config ./platypus-docs/tsd.json'
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-typescript');

    grunt.registerTask('build', ['shell', 'typescript'])

    grunt.registerTask('default', ['build']);
};
