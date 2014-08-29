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
        var namespaces = node['namespaces'];
        for (var n in namespaces) {
            saveAndTraverse(namespaces[n]);
        }
    }

    if (node['classes']) {
        var classes = node['classes'];
        for (var c in classes) {
            saveAndTraverse(classes[c]);
        }
    }

    if (node['methods']) {
        var methods = node['methods'];
        for (var m in methods) {
            saveAndTraverse(methods[m]);
        }
    }

    if (node['interfaces']) {
        var interfaces = node['interfaces'];
        for (var i in interfaces) {
            saveAndTraverse(interfaces[i]);
        }
    }

    if (node['properties']) {
        var properties = node['properties'];
        for (var p in properties) {
            saveAndTraverse(properties[p]);
        }
    }

    if (node['events']) {
        var events = node['events'];
        for (var e in events) {
            saveAndTraverse(events[e]);
        }
    }
};

var submitNode = (node: DocNodeTypes.INode) => {
    var procedures: any = null;
    switch (node.kind) {
        case 'namespace':
            procedures = new namespaceProcedure();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'interface':
            procedures = new interfaceProcedure();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'class':
            procedures = new classProcedures();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'method':
            procedures = new methodProcedures();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'property':
            procedures = new propertyProcedures();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'event':
            procedures = new eventProcedures();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        case 'parameter':
            procedures = new parameterProcedures();
            procedures.create(node).then((id) => {
                node.dbId = id;
            });
            break;
        default:
            throw new Error('unknown node type');
            break;
    }
};

export = saveDocTree;