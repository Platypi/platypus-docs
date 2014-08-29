﻿/// <reference path="typings/tsd.d.ts" />
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

var Promise = PromiseStatic.Promise;


var saveDocTree = (tree: any) => {
    if (utils.isObject(tree)) {
        saveAndTraverse(tree['plat'], 'namespaces').then(null, (err) => {
            console.log(err);
        });
    } else {
        throw new Error('Invalid Doc Tree: ' + tree);
    }
};

var saveAndTraverse = (node: DocNodeTypes.INode, kind: string): Thenable<any> => {
    // save node
    console.log('saving node: ' + node.name);
    return submitNode(node).then<void>(() => {
        // process children
        if (node[kind]) {
            var kinds = node[kind],
                promises = [];

            utils.forEach(kinds, (value: DocNodeTypes.INode) => {
                promises.push(saveAndTraverse(value, kind));
            });
            console.log(promises.length);
            return Promise.all(promises);
        } else {
            return <any>node;
        }
    });
};

var submitNode = (node: DocNodeTypes.INode): Thenable<any> => {
    if (node.kind) {
        var procedures: apiprocedures.ApiProcedures<any> = null;
        switch (node.kind) {
            case 'namespace':
                procedures = new namespaceProcedure();
                break;
            case 'interface':
                procedures = new interfaceProcedure();
                break;
            case 'class':
                procedures = new classProcedures();
                break;
            case 'method':
                procedures = new methodProcedures();
                break;
            case 'property':
                procedures = new propertyProcedures();
                break;
            case 'event':
                procedures = new eventProcedures();
                break;
            case 'parameter':
                procedures = new parameterProcedures();
                break;
            default:
                console.log(JSON.stringify(node, censor(node), 4));
                throw new Error('unknown node type: ' + node.kind);
                break;
        }

        if (procedures) {
            return procedures.create(node);
        }
    }
};

export = saveDocTree;


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