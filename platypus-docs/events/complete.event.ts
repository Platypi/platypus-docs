import globals = require('../variables/globals');

var ProgressBar = require('simple-progress-bar'),
    startTime = globals.startTime;

var setupEvent = () => {
    globals.pubsub.on('complete', () => {
        process.stdout.write('\r\nDone! Stats:');
        process.stdout.write('\r\n\tNumber of Nodes Saved:\t' + globals.nodeCount);
        process.stdout.write('\r\n\tTotal Time Elasped:\t' + Math.floor(((new Date().getTime() - startTime) / 1000)) + ' seconds.');
    });

};

export = setupEvent;
 