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
                            type: 'password',
                            message: 'Password:'
                        }
                    ]
                }
            },
            scriptGen: {
                options: {
                    questions: [
                        {
                            config: 'server.scripts',
                            type: 'confirm',
                            message: 'Do you want to generate MySql Schema Scripts?'
                        },
                        {
                            config: 'server.host',
                            type: 'input',
                            message: 'Server hostname:',
                            when: function (answers) {
                                return answers['server.scripts'];
                            }
                        },
                        {
                            config: 'server.dbName',
                            type: 'input',
                            message: 'Database name:',
                            when: function (answers) {
                                return answers['server.scripts'];
                            }
                        },
                        {
                            config: 'server.userName',
                            type: 'input',
                            message: 'Username:',
                            when: function (answers) {
                                return answers['server.scripts'];
                            }
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

    grunt.registerTask('generateSchemaFiles', 'Generates DB Schema files.', function () {
        var scripts = grunt.config('server.scripts'),
            selection = {
                host: grunt.config('server.host'),
                user: grunt.config('server.userName'),
                dbName: grunt.config('server.dbName')
            };

        if (scripts) {
            var tables = grunt.file.read('./platypus-docs/docsave/db/schema/tables/tables.txt'),
                procedures = grunt.file.read('./platypus-docs/docsave/db/schema/storedprocedures/storedprocedures.txt');

            tables = tables.replace(/%dbName%/g, selection.dbName)
                .replace(/%hostName%/g, selection.host)
                .replace(/%userName%/g, selection.user);

            procedures = procedures.replace(/%dbName%/g, selection.dbName)
                .replace(/%hostName%/g, selection.host)
                .replace(/%userName%/g, selection.user);

            grunt.file.mkdir('schema');

            grunt.file.write('./schema/tables.sql', tables);
            grunt.log.writeln('Created tables.sql');

            grunt.file.write('./schema/storedprocedures.sql', procedures);
            grunt.log.writeln('Created storedprocedures.sql');
        }
    });

    grunt.registerTask('configure', ['prompt:database', 'saveDbConfig']);

    grunt.registerTask('checkForDbConfig', "Check for dbconnection.json", function () {
        if (!grunt.file.isFile('./dbconnection.json')) {
            grunt.task.run(['configure']);
        }
    });

    grunt.registerTask('generate', ['prompt:scriptGen', 'generateSchemaFiles']);

    grunt.registerTask('build', ['shell', 'typescript']);

    grunt.registerTask('default', ['build', 'checkForDbConfig']);
};
