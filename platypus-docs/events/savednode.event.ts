import globals = require('../variables/globals');

var ProgressBar = require('simple-progress-bar'),
    savePb = null;

var setupEvent = () => {
    globals.pubsub.on('savedNode', (numSaved) => {
        savePb = savePb || new ProgressBar('Saving Graph to Storage: ', ':label \t [ :bar ] :percent ');
        savePb.update(1 + numSaved, globals.nodeCount);
    });
};

export = setupEvent;
