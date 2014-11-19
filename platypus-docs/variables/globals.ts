/*
 * Global Variables
 * Set by command line arguments.
 */

import EventEmitter = require('events');

export var startTime = new Date().getTime();

export var filename = 'platypus.ts';

export var linkBase = '/docs/api/';

export var versionNumber = '0.0.1';

export var debug = false;

export var pubsub = new EventEmitter.EventEmitter();

export var nodeCount = 0;

export var runTimeErrors: Array<string> = [];

export var consoleColors = {
    blue: '\033[94m',
    headerPink: '\033[95m',
    green: '\033[92m',
    warningRed: '\033[93m',
    fail: '\033[91m',
    endColor: '\033[0m'
};

export var consoleStyle = {
    bold: '\033[1m'
};

export var consoleColorWrap = (text: string, color: string) => {
    return color + text + consoleColors.endColor;
};
