import globals = require('../variables/globals');

var setupEvent = () => {
    globals.pubsub.on('error', (err) => {
        globals.runTimeErrors.push(err);
    });
};

export = setupEvent;
  