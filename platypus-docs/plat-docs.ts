/// <reference path="typings/tsd.d.ts" />

/*
 * Name:            Platypus Doc Generator
 * 
 * Author:          Donald Jones (donald@getplatypi.com)
 * 
 * Description:     Generates a graph of nodes representing the documentation
 *                  in the PlatypusTS source code. It then uploads the graph
 *                  into a database schema.
 */

import globals = require('./globals');
import docgen = require('./docgen');
import storage = require('./storegraph');

var filename = process.argv[2] || 'platypusts.ts',
    generator = new docgen.DocGen.DocGenerator();

if (process.argv[3]) {
    globals.linkBase = process.argv[3];
}

if (process.argv[4]) {
    globals.versionNumber = process.argv[4];
}

// Build the graph of nodes
console.log('Generating Graph from source comments.');
generator.buildGraphFromFile(filename, (graph: any) => {
    console.log('Storing graph in Database');
    storage(graph).then(null, (err) => {
        throw new Error(err);
    }).then(() => {
        // done
        process.exit(0);
    });
});