/*
 * Global Variables
 * Set by command line arguments.
 */

import EventEmitter = require('events');

export var linkBase = '/#!/docs/api/';

export var versionNumber = '0.0.1';

export var debug = false;

export var pubsub = new EventEmitter.EventEmitter();

export var nodeCount = 0;