/// <reference path="typings/tsd.d.ts" />
/// <reference path="docsave/db/db.d.ts" />

import DocNodeTypes = require('./docnodes');
import utils = require('./utils/utils');
import connection = require('./docsave/db/connection');

var saveDocTree = (tree: any) => {
    if (utils.isObject(tree) {
        traverseNodeAndSave(tree);
    } else {
        throw new Error('Invalid Doc Tree: ' + tree);
    }
};

var traverseNodeAndSave = (node: DocNodeTypes.INode) => {
    if (node['namespaces']) {
    }

    if (node['classes']) {
    }

    if (node['methods']) {
    }

    if (node['interfaces']) {
    }

    if (node['property']) {
    }
};

export = saveDocTree;