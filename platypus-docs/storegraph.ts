/// <reference path="typings/tsd.d.ts" />
/// <reference path="docsave/db/db.d.ts" />

/*
 * storegraph
 * Traverses the graph and stores the nodes in the database.
 */

import DocNodeTypes = require('./docnodes');
import utils = require('./utils/utils');
import PromiseStatic = require('es6-promise');

// procedure types
import globals = require('./globals');
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
import ds = require('./datastructures');
import markdown = require('./docmarkdown');

var Promise = PromiseStatic.Promise,
    parametersList = [],
    subproceduresList = [],
    failedClassesList = [],
    pendingLinks = [];


var saveDocGraph = (graph: any) => {
    if (Object.keys(ds.nameHashTable).length < 1) {
        throw new Error('namehash is empty');
    }
    if (utils.isObject(graph)) {
        return saveAndTraverse(graph['plat'], 'namespaces')
            .then(() => {
                return resolveParameters();
            }).then(() => {
                console.log('referencing sub types');
                return referenceSubTypes();
            }).then(() => {
                // replace links
                return updatePendingLinks();
            }).then(() => {
                console.log('done');
            }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
    } else {
        return Promise.reject(new Error('Invalid Doc Graph: ' + graph));
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
                    var namespaces: Array<any> = [],
                        fn: any = null;
                    utils.forEach(node, (child: DocNodeTypes.INode, key) => {
                        if (key === 'parent' || key === 'extends' || key === 'namespace') {
                            return;
                        }

                        if (child && child.kind && !child.saved && !child.id) {
                            fn = saveAndTraverse.bind(null, child, child.kind);
                            if (child.kind === 'namespace') {
                                namespaces.push(fn)
                            } else {
                                fns.push(fn);
                            }
                        }
                    });
                    fns = fns.concat(namespaces);
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

                // if the description or remark has links to be replaced
                // push to an array so that they can be replaced after all
                // nodes have been saved.

                if (node.description_ || node.remarks) {
                    if ((node.description_.indexOf('@link') > -1) || (node.remarks && node.remarks.indexOf('@link') > -1)) {
                        pendingLinks.push(linkToMarkdown.bind(null, node, procedures));
                    }
                }

                if (Object.keys(node.typeparams).length > 0) {
                    var tp = new typeParameterProcedures();
                    
                }

                if (!subprocedures) {
                    var rtnPromise = procedures.create(node);
                    if (node.kind === 'method') {
                        var methodNode: DocNodeTypes.IMethodNode = (<DocNodeTypes.IMethodNode>node);
                        utils.forEach(Object.keys(methodNode.parameters), (value) => {
                            var parameter = methodNode.parameters[value];
                            parametersList.push(submitNode.bind(null, parameter));
                        });
                    }
                    return rtnPromise;
                } else {
                    return procedures.create(node).then(null, (err) => {
                        console.log(node.name_);
                        console.log((<any>node).parentString);
                        console.log((<any>node).extends.id);
                        throw err;
                    }).then((id) => {
                            if (utils.isObject(node[subprocedureType])) {
                                utils.forEach(node[subprocedureType], (value: any) => {
                                    if (utils.isNull(value.kind)) {
                                        return;
                                    }
                                    subproceduresList.push(ParentToChildNode.bind(null, node, value, subprocedures));
                                });
                            }
                        });
                }
            } else {
                return Promise.resolve();
            } 
        } else {
            return Promise.reject(node);
        }
    }
    console.log(node.name_ + ' ' + node.kind + ' is a problem');
    console.log('shouldnt reach here');

};

var ParentToChildNode = (node: DocNodeTypes.INode, extendedNode: DocNodeTypes.INode, procedure: apiprocedures.ApiProcedures<any>): Thenable<any> => {
    if (utils.isObject(procedure) && utils.isFunction(procedure.create)) {

        if (utils.isNull(node.id)) {
            console.log('Node: ' + node.name_ + ' has no id.');
            return;
        }

        if (utils.isNull(extendedNode.id)) {
            console.log('Extended node: ' + extendedNode.name_ + ' has no id.');
            return;
        }

        var saveObj = {
            id: <number>node.id,
            extendedId: <number>extendedNode.id
        };
        return procedure.create(saveObj);
    }
};

var referenceSubTypes = (): Thenable<any> => {
    var promises = [];
    for (var i = 0; i < subproceduresList.length; i++) {
        promises.push(subproceduresList[i]());
    }
    return Promise.all(promises);
};

var updatePendingLinks = (): Thenable<any> => {
    console.log('updating pending links number: ' + pendingLinks.length);
    var promises = [];
    for (var i = 0; i < pendingLinks.length; i++) {
        promises.push(pendingLinks[i]());
    }
    return Promise.all(promises);
};

var resolveParameters = (): Thenable<any> => {
    console.log('storing parameters for methods, count: ' + parametersList.length);
    var promises = [];
    for (var i = 0; i < parametersList.length; i++) {
        promises.push(parametersList[i]());
    }
    return Promise.all(promises);
};


var linkToMarkdown = (node: DocNodeTypes.INode, procedure: apiprocedures.ApiProcedures<DocNodeTypes.INode>): Thenable<any> => {
    if (node.id && node.id > 0) {
        // add links to remarks & description
        if (node.description_) {
            node.description_ = markdown(node.description_, globals.linkBase);
        }

        if (node.remarks) {
            node.remarks = markdown(node.remarks, globals.linkBase);
        }

        //update node
        return procedure.update(node);
    } else {
        console.log(node.name_ + ' has no id!!!!');
        return Promise.reject(null);
    }
};

export = saveDocGraph;


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