/// <reference path="typings/tsd.d.ts" />
/// <reference path="docsave/db/db.d.ts" />

import DocNodeTypes = require('./docnodes');
import utils = require('./utils/utils');
import PromiseStatic = require('es6-promise');

// procedure types
import apiprocedures = require('./docsave/db/procedures/api.procedures');
import namespaceProcedure = require('./docsave/db/procedures/namespace.procedures');
import interfaceProcedure = require('./docsave/db/procedures/interface.procedures');
import classProcedures = require('./docsave/db/procedures/class.procedures');
import methodProcedures = require('./docsave/db/procedures/method.procedures');
import propertyProcedures = require('./docsave/db/procedures/property.procedures');
import parameterProcedures = require('./docsave/db/procedures/parameter.procedures');
import eventProcedures = require('./docsave/db/procedures/event.procedures');
import classInterfaceProcedures = require('./docsave/db/procedures/class.interface.procedures');
import interfaceInterfaceProcedures = require('./docsave/db/procedures/interface.interface.procedures');
import typeParameterProcedures = require('./docsave/db/procedures/type.parameter.procedures');


var saveDocTree = (tree: any) => {
    if (utils.isObject(tree) {
        saveAndTraverse(tree);
    } else {
        throw new Error('Invalid Doc Tree: ' + tree);
    }
};

var saveAndTraverse = (node: DocNodeTypes.INode) => {
    // save node
    submitNode(node);

    // process children
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

    if (node['event']) {
    }
};

var submitNode = (node: DocNodeTypes.INode) => {
    var procedure: any = null;
    switch (node.kind) {
        case 'namespace':
            procedure = new namespaceProcedure();
            procedure.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'interface':
            
            break;
        case 'class':
            break;
        case 'method':
            break;
        case 'property':
            break;
        case 'event':
            break;
        case 'parameter':
            break;
        default:
            throw new Error('unknown node type');
            break;
    }
};

export = saveDocTree;