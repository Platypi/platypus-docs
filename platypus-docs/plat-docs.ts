/// <reference path="_references.ts" />

/*
 * Name:            Platypus Doc Generator
 * 
 * Author:          Donald Jones (donald@getplatypi.com)
 * 
 * Description:     Generates a graph of nodes representing the documentation
 *                  in the PlatypusTS source code. It then uploads the graph
 *                  into a database schema.
 */

import globals = require('./variables/globals');
import docgen = require('./generator/docgen');
import storage = require('./docsave/storegraph');
import events = require('./events/docevents');

var generator = new docgen.DocGen.DocGenerator(),
    package = require('../package.json');

// get command line arguments if any, otherwise revert to default values
globals.filename = (process.argv[2] ? process.argv[2] : globals.filename);
globals.linkBase = (process.argv[3] ? process.argv[3] : globals.linkBase);
globals.versionNumber = (process.argv[4] ? process.argv[4] : globals.versionNumber);
globals.debug = (process.argv[5] && process.argv[5].indexOf('true') > 0 ? true : false);

process.stdout.write(globals.consoleColorWrap('\r\n' + package.name + '\r\nVersion: '
    + package.version + '\r\n' + package.homepage
    + '\r\n', globals.consoleColors.headerPink
    + globals.consoleStyle.bold));

// start the event listeners
events.setupEvents();

// build the graph of nodes
generator.buildGraphFromFile(globals.filename)
    .then((graph) => {
        return storage(graph);
    }).then(null, (err) => {
        throw new Error(err);
    }).then(() => {
        process.exit(0);
    });
