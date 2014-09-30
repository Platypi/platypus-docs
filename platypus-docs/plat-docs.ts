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

var startTime = new Date().getTime(),
    generator = new docgen.DocGen.DocGenerator(),
    ProgressBar = require('simple-progress-bar'),
    flatPb = null,
    graphPb = null,
    savePb = null;

// get command line arguments if any, otherwise revert to default values
globals.filename = (process.argv[2] ? process.argv[2] : globals.filename);
globals.linkBase = (process.argv[3] ? process.argv[3] : globals.linkBase);
globals.versionNumber = (process.argv[4] ? process.argv[4] : globals.versionNumber);
globals.debug = (process.argv[5] && process.argv[5].indexOf('true') > 0 ? true : false);

// build the graph of nodes
generator.buildGraphFromFile(globals.filename).then((graph) => {
    return storage(graph);
}).then(null, (err) => {
    throw new Error(err);
}).then(() => {
    process.exit(0);
});

globals.pubsub.on('populateFlat', (processedTags, totalTags) => {
    flatPb = flatPb || new ProgressBar('Generating Nodes from tags: ', ':label \t [ :bar ] :percent ');
    flatPb.update(1 + processedTags, totalTags);
});

globals.pubsub.on('graphGen', (processedKinds, totalKinds) => {
    graphPb = graphPb || new ProgressBar('Generating Graph from Nodes: ', ':label \t [ :bar ] :percent ');
    graphPb.update(1 + processedKinds, totalKinds);
});

globals.pubsub.on('savedNode', (numSaved) => {
    savePb = savePb || new ProgressBar('Saving Graph to Storage: ', ':label \t [ :bar ] :percent ');
    savePb.update(1 + numSaved, globals.nodeCount);
});

globals.pubsub.on('done', () => {
    savePb.update(globals.nodeCount, globals.nodeCount);
    process.stdout.write('\r\nDone! Stats:');
    process.stdout.write('\r\n\tNumber of Nodes Saved:\t' + globals.nodeCount);
    process.stdout.write('\r\n\tTotal Time Elasped:\t' + Math.floor(((new Date().getTime() - startTime) / 1000)) + ' seconds.');
});
