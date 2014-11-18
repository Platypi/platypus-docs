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

        if (globals.runTimeErrors.length > 0) {
            var errors = globals.runTimeErrors;

            process.stdout.write(colorwrap('\r\nA few non-critical runtime errors occurred:\r\n', colors.fail));

            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];

                process.stdout.write(colorwrap(error, colors.fail) + '\r\n');
            }
        }

    });

};

export = setupEvent;
 