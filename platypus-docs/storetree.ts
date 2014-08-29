/// <reference path="typings/tsd.d.ts" />
/// <reference path="docsave/db/db.d.ts" />

import DocNodeTypes = require('./docnodes');
import utils = require('./utils/utils');
import connection = require('./docsave/db/connection');

var saveDocTree = (tree: any) => {
    if (utils.isObject(tree) {
        for (var key in tree) {
            var currentNode: DocNodeTypes.INode = tree[key];
            traverseNodeAndSave(currentNode);
        }
    } else {
        throw new Error('Invalid Doc Tree: ' + tree);
    }
};

var traverseNodeAndSave = (node: DocNodeTypes.INode) => {

};

export = saveDocTree;