/// <reference path="typings/tsd.d.ts" />
/// <reference path="docgen.ts" />

import DocGen = require('./docgen');
import store = require('./storegraph');

var filename = process.argv[2] || './test-data/sample.ts',
    gen = new DocGen.DocGen.DocGenerator();

console.log('generating graph');
gen.buildGraphFromFile(filename, (tree: any) => {
    //console.log(tree);
    console.log('storing tree');
    store(tree)
        .then(null, (err) => {
            console.log(err);
        })
        .then(() => {
            process.exit(0);
        });
});


function censor(censor) {
    var i = 0;

    return function (key, value) {
        if (key === 'parent' ||
            key === 'namespace' ||
            key === 'class' ||
            key === 'interface' ||
            key === 'interfaceNode' ||
            key === 'namespaceNode' ||
            key === 'classNode' ||
            key === 'returntype' ||
            key === 'method') {
            if (value && value.name && value.name !== '') {
                return '[Circular] ' + (value ? value.name : '');
            } else {
                return '[Circular] ' + (value ? value.type : '');
            }
        }

        return value;
    };
}