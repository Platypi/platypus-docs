/// <reference path="../_references.ts" />

/*
 * storegraph
 * Traverses the graph and stores the nodes in the database.
 */

import utils = require('../utils/utils');
import PromiseStatic = require('es6-promise');

// procedure types
import globals = require('../variables/globals');
import apiprocedures = require('../docsave/db/procedures/api.procedures');
import namespaceProcedure = require('../docsave/db/procedures/namespace.procedures');
import interfaceProcedure = require('../docsave/db/procedures/interface.procedures');
import classProcedures = require('../docsave/db/procedures/class.procedures');
import methodProcedures = require('../docsave/db/procedures/method.procedures');
import propertyProcedures = require('../docsave/db/procedures/property.procedures');
import parameterProcedures = require('../docsave/db/procedures/parameter.procedures');
import eventProcedures = require('../docsave/db/procedures/event.procedures');
import classInterfaceProcedures = require('../docsave/db/procedures/class.interface.procedures');
import interfaceInterfaceProcedures = require('../docsave/db/procedures/interface.interface.procedures');
import typeParameterProcedures = require('../docsave/db/procedures/type.parameter.procedures');
import ds = require('../variables/datastructures');
import markdown = require('../converters/docmarkdown');

var Promise = PromiseStatic.Promise,
    parametersList = [],
    typeparametersList = [],
    subproceduresList = [],
    pendingLinks = [],
    savedNodes = 0;

/*
 * Stores the given graph in persistent storage.
 * 
 * @param graph A graph data structure containing nodes.
 */
var saveDocGraph = (graph: any) => {
    if (Object.keys(ds.nameHashTable).length < 1) {
        throw new Error('namehash is empty');
    }
    if (utils.isObject(graph)) {
        return saveAndTraverse(graph.plat, 'namespaces')
            .then(() => {
                return resolveParameters();
            }).then(() => {
                return resolveTypeParams();
            }).then(() => {
                return referenceSubTypes();
            }).then(() => {
                // replace links
                return updatePendingLinks();
            }).then(() => {
                globals.pubsub.emit('complete', '');
            }, (err) => {
                if (err) {
                    console.log(err);
                }
            });
    } else {
        return Promise.reject(new Error('Invalid Doc Graph: ' + graph));
    }
};

var saveAndTraverse = (node: INode, kind: string): Thenable<any> => {
    // save node

    return new Promise((resolve, reject) => {
        var fns = [];

        function traverse(fn: () => Thenable<any>, next: () => void) {
            fn().then(next, (err) => {
                reject(err);
            });
        }

        /*
         * Determine if we have processed all queued nodes, 
         *  if not recursively call the traverse method.
         */
        function next() {
            if (fns.length === 0) {
                resolve();
            }

            traverse(fns.shift(), next);
        }
        
        try {
            if (globals.debug) {
                console.log('Creating: ' + node.name_);
            }
            submitNode(node)
                .then<void>(() => {
                    savedNodes++;
                    node.saved = true;
                    
                    // process children
                    var namespaces: Array<any> = [],
                        fn: any = null;
                    utils.forEach(node, (child: INode, key) => {
                        if (key === 'parent' || key === 'extends' || key === 'namespace') {
                            return;
                        }

                        if (child && child.kind && !child.saved && !child.id_) {
                            fn = saveAndTraverse.bind(null, child, child.kind);
                            if (child.kind === 'namespace') {
                                namespaces.push(fn);
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

var submitNode = (node: INode): Thenable<any> => {
    if (node.kind) {
        var procedures: apiprocedures.ApiProcedures<any> = null,
            subprocedures: apiprocedures.ApiProcedures<any> = null,
            subprocedureType: string = '',
            kind = node.kind;

        if (kind === 'namespace') {
            procedures = new namespaceProcedure();

        } else if (kind === 'interface') {
            procedures = new interfaceProcedure();
            // save interface-interface for future use
            subprocedureType = 'interfaces';
            subprocedures = new interfaceInterfaceProcedures();

        } else if (kind === 'class') {
            procedures = new classProcedures();
            // save class-interface procedure for future use
            subprocedureType = 'interfaces';
            subprocedures = new classInterfaceProcedures();

        } else if (kind === 'method') {
            procedures = new methodProcedures();

        } else if (kind === 'property') {
            procedures = new propertyProcedures();

        } else if (kind === 'event') {
            procedures = new eventProcedures();

        } else if (kind === 'parameter') {
            procedures = new parameterProcedures();

        } else {
            console.log(JSON.stringify(node, censor(node), 4));
            throw new Error('unknown node type: ' + node.kind);

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

                // handle typeparameters
                if (node.typeparameters) {
                    utils.forEach(Object.keys(node.typeparameters), (value) => {
                        var typeparameter = node.typeparameters[value];
                        typeparametersList.push(buildTypeParameter.bind(null, node, typeparameter));
                    });
                }

                if (!subprocedures) {
                    var rtnPromise = procedures.create(node);
                    if (node.kind === 'method') {
                        var methodNode: IMethodNode = (<IMethodNode>node);
                        utils.forEach(Object.keys(methodNode.parameters), (value) => {
                            var parameter = methodNode.parameters[value];
                            parametersList.push(submitNode.bind(null, parameter));
                        });
                    }
                    return rtnPromise;
                } else {
                    return procedures.create(node).then(null, (err) => {
                        if (globals.debug) {
                            console.log(node.name_);
                            console.log((<any>node).parentString);
                            console.log((<any>node).extends.id_);
                        }
                        throw err;
                    }).then((id) => {
                            globals.pubsub.emit('savedNode', savedNodes);
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

    // fall through
    if (globals.debug) {
        console.log(node.name_ + ' ' + node.kind + ' is a problem');
        console.log('shouldnt reach here');
    }
    globals.pubsub.emit('error', node.name_ + ' has no \'kind\' property.');
};

var ParentToChildNode = (node: INode, extendedNode: INode, procedure: apiprocedures.ApiProcedures<any>): Thenable<any> => {
    if (utils.isObject(procedure) && utils.isFunction(procedure.create)) {

        if (utils.isNull(node.id_)) {
            if (globals.debug) {
                console.log('Node: ' + node.name_ + ' has no id.');
            }
            globals.pubsub.emit('error', node.name_ + ' could not be extended to ' + extendedNode.name_ + ' because it has no id.');
            return;
        }

        if (utils.isNull(extendedNode.id_)) {
            if (globals.debug) {
                console.log('Extended node: ' + extendedNode.name_ + ' has no id.');
            }
            globals.pubsub.emit('error', node.name_ + ' could not be extended to ' + extendedNode.name_ + ' because it has no id.');
            return;
        }

        var saveObj = {
            id_: <number>node.id_,
            extendedId: <number>extendedNode.id_
        };
        return procedure.create(saveObj);
    }
};

var buildTypeParameter = (node: INode, typeParamNode: ITypeParameterNode): Thenable<any> => {
    var tp = new typeParameterProcedures();
    if (utils.isObject(node) && utils.isObject(typeParamNode)) {
        var namehash = ds.nameHashTable,
            typeRef: INode = namehash[typeParamNode.typeString];

        if (utils.isObject(typeRef)) {
            var kind = typeRef.kind;

            if (kind === 'method') {
                typeParamNode.methodtype = typeRef;
            } else if (kind === 'class') {
                typeParamNode.classtype = typeRef;
            } else if (kind === ' interface') {
                typeParamNode.interfacetype = typeRef;
            }

        }
        return tp.create(typeParamNode).then(() => {
            globals.pubsub.emit('savedNode', savedNodes);
        });
    }
};

var resolveTypeParams = (): Thenable<any> => {
    var promises = [];
    for (var i = 0; i < typeparametersList.length; i++) {
        promises.push(typeparametersList[i]());
    }
    return Promise.all(promises);
};

var referenceSubTypes = (): Thenable<any> => {
    var promises = [];
    for (var i = 0; i < subproceduresList.length; i++) {
        promises.push(subproceduresList[i]());
    }
    return Promise.all(promises);
};

var updatePendingLinks = (): Thenable<any> => {
    var promises = [];
    for (var i = 0; i < pendingLinks.length; i++) {
        promises.push(pendingLinks[i]());
    }
    return Promise.all(promises);
};

var resolveParameters = (): Thenable<any> => {
    var promises = [];
    for (var i = 0; i < parametersList.length; i++) {
        promises.push(parametersList[i]());
    }
    return Promise.all(promises);
};


var linkToMarkdown = (node: INode, procedure: apiprocedures.ApiProcedures<INode>): Thenable<any> => {
    if (node.id_ && node.id_ > 0) {
        // add links to remarks & description
        if (node.description_) {
            node.description_ = markdown(node.description_, globals.linkBase);
        }

        if (node.remarks) {
            node.remarks = markdown(node.remarks, globals.linkBase);
        }

        // update node
        return procedure.update(node);
    } else {
        if (globals.debug) {
            console.log(node.name_ + ' has no id!!!!');
        }
        globals.pubsub.emit('error', node.name_ + ' could not be processed by the markdown module (no id)');
        return Promise.reject(null);
    }
};

export = saveDocGraph;


function censor(censor) {

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