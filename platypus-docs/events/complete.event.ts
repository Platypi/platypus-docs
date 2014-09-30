import globals = require('../variables/globals');

var startTime = globals.startTime,
    colors = globals.consoleColors,
    styles = globals.consoleStyle,
    colorwrap = globals.consoleColorWrap;

var setupEvent = () => {
    globals.pubsub.on('complete', () => {
        process.stdout.write(colorwrap('\r\nDone! Stats:',colors.blue + styles.bold));
        process.stdout.write(colorwrap('\r\n\tNumber of Nodes Saved:\t' + globals.nodeCount,colors.green));
        process.stdout.write(colorwrap('\r\n\tTotal Time Elasped:\t'
            + Math.floor(((new Date().getTime() - startTime) / 1000))
            + ' seconds.', colors.warningRed));
    });

};

export = setupEvent;
 