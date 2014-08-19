/// <reference path="typings/tsd.d.ts" />
var parser = require('comment-parser');

parser.file('./test-data/sample.ts', (err: any, data: any) => {
    console.log(JSON.stringify(data));
});