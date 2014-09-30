import globals = require('../variables/globals');

var ProgressBar = require('simple-progress-bar'),
    flatPb = null;

var setupEvent = () => {
    globals.pubsub.on('populateFlat', (processedTags, totalTags) => {
        flatPb = flatPb || new ProgressBar('Generating Nodes from Tags: ', ':label \t [ :bar ] :percent ');
        flatPb.update(1 + processedTags, totalTags);
    });
};

export = setupEvent;
