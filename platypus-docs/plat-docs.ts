﻿/// <reference path="_references.ts" />

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

var filename = process.argv[2] || 'platypusts.ts',
    generator = new docgen.DocGen.DocGenerator();

if (process.argv[3]) {
    globals.linkBase = process.argv[3];
}

if (process.argv[4]) {
    globals.versionNumber = process.argv[4];
}

// build the graph of nodes
console.log('Generating Graph from source comments.');
generator.buildGraphFromFile(filename).then((graph) => {
    console.log('Storing graph in Database');
    return storage(graph);
}).then(null, (err) => {
    throw new Error(err);
}).then(() => {
    process.exit(0);
});
