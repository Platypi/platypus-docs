import globals = require('../variables/globals');

var ProgressBar = require('simple-progress-bar'),
    graphPb = null;

var setupEvent = () => {
    globals.pubsub.on('graphGen', (processedKinds, totalKinds) => {
        graphPb = graphPb || new ProgressBar('Generating Graph from Nodes: ', ':label \t [ :bar ] :percent ');
        graphPb.update(1 + processedKinds, totalKinds);
    });
};

export = setupEvent;
