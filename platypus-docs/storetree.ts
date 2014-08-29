/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

import DocNodeTypes = require('./docnodes');
import utils = require('./utils/utils');

var saveDocTree = (tree: any) => {
    if (utils.isObject(tree) {
        for (var key in tree) {
            var currentNode: DocNodeTypes.INode = tree[key];

        }
    } else {
        throw new Error('Invalid Doc Tree: ' + tree);
    }
});