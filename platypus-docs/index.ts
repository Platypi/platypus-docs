/// <reference path="typings/tsd.d.ts" />
/// <reference path="docgen.ts" />

import DocGen = require('./docgen');

var filename = process.argv[2] || './test-data/sample.ts',
    gen = new DocGen.DocGen.DocGenerator();

gen.fromFile(filename);