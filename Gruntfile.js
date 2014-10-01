module.exports = function (grunt) {
    var files = [
        './platypus-docs/**/*.ts',
        './platypus-docs/!(typings)/*.ts'
    ];

    grunt.initConfig({
        prompt: {
            database: {
                options: {
                    questions: [
                        {
                            config: 'server.selection',
                            type: 'list',
                            message: 'Generate docs on which server: ',
                            choices: [
                                {
                                    value: {
                                        host: 'us-cdbr-azure-east-a.cloudapp.net',
                                        dbName: 'platypiwebdev',
                                        user: 'b091fc43c1a652'
                                    },
                                    name: 'DEV (platypiwebdev)'
                                },
                                {
                                    value: {
                                        host: 'us-cdbr-azure-east-a.cloudapp.net',
                                        dbName: 'platypiweb',
                                        user: 'b41c2115ab2d1a'
                                    },
                                    name: 'PRODUCTION (platypiweb)'
                                }
                            ]
                        },
                        {
                            config: 'server.password',
                            type: 'input',
                            message: 'Password:'
                        }
                    ]
                }
            }
        },
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
    grunt.loadNpmTasks('grunt-prompt');

    grunt.registerTask('saveDbConfig', 'Output a db json file.', function () {
        var selection = grunt.config('server.selection'),
            password = grunt.config('server.password'),
            db = {
                database: {
                    host: selection.host,
                    user: selection.user,
                    dbName: selection.dbName,
                    password: password
                }
            };

        grunt.file.write('dbconnection.json', JSON.stringify(db));

        grunt.log.writeln('Saved dbconnection.json');
    });

    grunt.registerTask('configure', ['prompt:database', 'saveDbConfig']);

    grunt.registerTask('checkForDbConfig', "Check for dbconnection.json", function () {
        if (!grunt.file.isFile('./dbconnection.json')) {
            grunt.task.run(['configure']);
        }
    });

    grunt.registerTask('build', ['shell', 'typescript'])

    grunt.registerTask('default', ['build', 'checkForDbConfig']);
};
