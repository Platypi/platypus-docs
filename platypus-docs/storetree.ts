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

var Promise = PromiseStatic.Promise,
    subproceduresList = [];


var saveDocTree = (tree: any) => {
    if (utils.isObject(tree)) {
        return saveAndTraverse(tree['plat'], 'namespaces').then(() => {
            // second traversal to fill in missing ids
            console.log('done');
        }, (err) => {
            if (err) {
                console.log(err);
            }
        });
    } else {
        return Promise.reject(new Error('Invalid Doc Tree: ' + tree));
    }
};

var saveAndTraverse = (node: DocNodeTypes.INode, kind: string): Thenable<any> => {
    // save node

    return new Promise((resolve, reject) => {
        var fns = [];

        function traverse(fn: () => Thenable<any>, next: () => void) {
            fn().then(next, (err) => {
                reject(err);
            });
        }

        function next() {
            if (fns.length === 0) {
                resolve();
            }

            traverse(fns.shift(), next);
        }
        
        try {
            //console.log('Creating: ' + node.name_);
            submitNode(node)
                .then<void>(() => {
                    node.saved = true;
                    // process children
                    utils.forEach(node, (child: DocNodeTypes.INode, key) => {
                        if (child && child.kind && !child.saved && !child.id) {
                            //console.log('childnode name: ' + child.name_ + ' childnode id: ' + child.id + ' childnode kind: ' + child.kind + ' parent node: ' + node.name_ + ' parent id: ' + node.id);
                            fns.push(saveAndTraverse.bind(null, child, child.kind));
                        }
                    });
                    next();

                })
                .then(null, (err) => {
                    reject(err);
                });
        } catch (err) {
            reject(err);
        }
    });
};

var submitNode = (node: DocNodeTypes.INode): Thenable<any> => {
    if (node.kind) {
        var procedures: apiprocedures.ApiProcedures<any> = null,
            subprocedures: apiprocedures.ApiProcedures<any> = null,
            subprocedureType: string = '';

        switch (node.kind) {
            case 'namespace':
                procedures = new namespaceProcedure();
                break;
            case 'interface':
                procedures = new interfaceProcedure();
                // save interface-interface for future use
                subprocedureType = 'interfaces';
                subprocedures = new interfaceInterfaceProcedures();
                break;
            case 'class':
                procedures = new classProcedures();
                // save class-interface procedure for future use
                subprocedureType = 'interfaces';
                subprocedures = new classInterfaceProcedures();
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

        // setup type parameters if there are any
        
        if (procedures) {
            if (!node.saved) {
                if (!subprocedures) {
                    console.log(node.name_);
                    return procedures.create(node);
                } else {
                    var topProc = procedures.create(node).then((id) => {
                        for (var t in Object.keys(node[subprocedureType])) {
                            var currentChild = node[subprocedureType][t];

                            subproceduresList.push(ParentToChildNode.bind(null, node, currentChild));
                        }
                    });
                }
            }  
            } else {
                return Promise.reject(node);
            }
        }
        console.log(node.name_ + ' ' + node.kind + ' is a problem');
        console.log('shouldnt reach here');
    }
};

var ParentToChildNode = (parentNode: DocNodeTypes.INode, childNode: DocNodeTypes.INode, procedure: apiprocedures.ApiProcedures<any>): Thenable<any> => {
    if (utils.isFunction(procedure)) {
        var saveObj = {
            parentId: <number>parentNode.id,
            childId: <number>childNode.id
        };
        return procedure.create(saveObj);
    }
};

var referenceSubTypes = (): Thenable<any> => {
    var promises = [];
    for (var i = 0; i < subproceduresList.length; i++) {
        promises.push(subproceduresList[i]());
    }
    return Promise.all(subproceduresList);
};

//var secondTraversal = (node: DocNodeTypes.INode) => {
//    for (var k in Object.keys(node)) {
//        var currentNode = node[k];
//        if (currentNode.kind) {
//            var subType = node['subprocedureType'] || '',
//                subproc = node['subprocedures'] || null;

//            if (subproc) {
//                for (var sub in currentNode[subType]) {
//                    var currentChild = currentNode[subType][sub],
//                        saveObj = {
//                            parentId: <number>currentNode.id || 0,
//                            childId: <number>currentChild.id || 0
//                        };

//                    if (saveObj.childId > 0 && saveObj.parentId > 0) {

//                    }
//                }
//            }
//        }
//    }
//};

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