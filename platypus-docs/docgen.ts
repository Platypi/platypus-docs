/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

/*
 * DocGen
 * Generates the document graph.
 */

import types = require('./docnodes');
import fs = require('fs');
import ds = require('./datastructures');
import tags = require('./tagbuilder');

import methodhandler = require('./nodehandlers/method.handler');
import propertyhandler = require('./nodehandlers/property.handler');
import classhandler = require('./nodehandlers/class.handler');
import interfacehandler = require('./nodehandlers/interface.handler');
import eventhandler = require('./nodehandlers/event.handler');
import namespacehandler = require('./nodehandlers/namespace.handler');

var parser = require('comment-parser');

export module DocGen {
    
    /**
     * Generate Docs from source file.
     */
    export class DocGenerator {

        nameHash = ds.nameHashTable;

        callback = (graph) => { };

        debug = false;

        buildGraphFromFile = (src: string, callback: (graph) => void, debug: boolean = false) => {
            this.debug = debug;
            if (callback) {
                this.callback = callback;
            }

            fs.readFile(src, { 
                encoding: 'utf8'
            }, (err, data) => {
                this.__parsedCommentsHandler(err, data && parser(data.toString()));
            });
        };

        private __parsedCommentsHandler = (err: any, data: any) => {
            if (!err) {
                this.__graphGen(data, this.__graphHandler);
            } else {
                console.log(new Error(err));
            }
        };


        private __graphHandler = (graph: any) => {
            if (this.debug) {
                console.log(JSON.stringify(graph, censor(graph), 4));
            }

            if (this.callback) {
                ds.nameHashTable = this.nameHash;
                this.callback(graph);
            }
        };

        /**
         * Generate a graph of tags as they appear in code.
         */
        private __graphGen = (tags: any, callback: (graph: any) => void) => {
            /*
             * First run through will generate a flat 
             * data structure as we may not yet have all the tags
             * need to reference each other in memory.
             */
            var flat = ds.flat;

            /**
             * Two loops are needed as the output of the parser 
             * results in nested tags.
             */
            for (var k in tags) {

                // tmpObj stores the tags in an object so they can be referenced by name.
                var parsedDocTags: tags.ParsedDocNode = tags.buildTags(tags[k]);


                if (parsedDocTags.kind) {
                    var kind: string = (<string>parsedDocTags.kind.name).trim().toLowerCase();

                    switch (kind) {
                        case 'function':
                            var newMethod = methodhandler.MakeNewMethodNode(parsedDocTags),
                                methodName = (newMethod.name_ !== '') ? newMethod.memberof.toUpperCase() + '.' + newMethod.name_.toUpperCase() : '()';

                            if (!(flat.methods[methodName] instanceof Array)) {
                                flat.methods[methodName] = [];
                            }

                            flat.methods[methodName].push(newMethod);
                            this.nameHash[methodName] = flat.methods[methodName];
                            
                            break;
                        case 'property':
                            var newProperty = propertyhandler.MakeNewPropertyNode(parsedDocTags),
                                propertyName = newProperty.memberof + '.' + newProperty.name_;

                            flat.properties[propertyName] = newProperty;
                            this.nameHash[propertyName] = flat.properties[propertyName];

                            break;
                        case 'class':
                            var newClass = classhandler.MakeNewClassNode(parsedDocTags),
                                className = newClass.memberof + '.' + newClass.name_;

                            flat.classes[className] = newClass;
                            this.nameHash[className] = flat.classes[className];
                            
                            break;
                        case 'interface':
                            var newInterface = interfacehandler.MakeNewInterfaceNode(parsedDocTags),
                                interfaceName = newInterface.memberof + '.' + newInterface.name_;

                            flat.interfaces[interfaceName] = newInterface;
                            this.nameHash[interfaceName] = flat.interfaces[interfaceName];
                            
                            break;
                        case 'event':
                            var newEvent = eventhandler.MakeNewEventNode(parsedDocTags),
                                eventName = newEvent.memberof + '.' + newEvent.name_;

                            flat.events[eventName] = newEvent;
                            this.nameHash[eventName] = flat.events[eventName];

                            break;
                        case 'namespace':
                            var newNamespace = namespacehandler.MakeNewNamespaceNode(parsedDocTags),
                                namespaceName = '';

                            // account for root namespaces
                            if (!!newNamespace.memberof) {
                                namespaceName = newNamespace.memberof + '.' + newNamespace.name_;
                            } else {
                                namespaceName = newNamespace.name_;
                            }

                            flat.namespaces[namespaceName] = newNamespace;
                            this.nameHash[namespaceName] = flat.namespaces[namespaceName];

                            break;
                    }
                }
            }

            // start building the graph with namespaces
            for (var namespace in flat.namespaces) {
                var currentNamespace = flat.namespaces[namespace],
                    parent = null;

                if (currentNamespace.memberof) {
                    ds.findNode(currentNamespace, (node) => {
                        parent = node;
                        currentNamespace.parent = parent;

                        if (!parent) {
                            return;
                        }

                        ds.appendChild(currentNamespace, parent);
                    });
                } else {
                    ds.graph[currentNamespace.name_] = currentNamespace;
                }
            }
            //interfaces
            for (var interfaceNode in flat.interfaces) {
                var currentInterface = flat.interfaces[interfaceNode],
                    parent = null;

                ds.findNode(currentInterface, (node) => {
                    parent = node;
                    currentInterface.parent = parent;

                    for (var i in currentInterface.interfaces) {
                        currentInterface.interfaces[i] = this.nameHash[currentInterface.interfaces[i].name_] || currentInterface.interfaces[i];
                    }

                    ds.appendChild(currentInterface, parent);
                });
            }

            //classes
            for (var classNode in flat.classes) {
                var currentClass = flat.classes[classNode],
                    parent = null;

                currentClass.namespace = this.nameHash[currentClass.namespaceString];
                currentClass.extends = this.nameHash[currentClass.parentString];

                parent = currentClass.parent = currentClass.namespace;

                for (var i in currentClass.interfaces) {
                    currentClass.interfaces[i] = this.nameHash[currentClass.interfaces[i].name_] || currentClass.interfaces[i];
                }

                ds.appendChild(currentClass, parent);
            }

            //methods
            for (var methodArrayNode in flat.methods) {
                for (var methodNode in flat.methods[methodArrayNode]) {
                    var currentMethod = flat.methods[methodArrayNode][methodNode],
                        parent = null,
                        returnTypeName = (typeof currentMethod.returntype === 'string' ? currentMethod.returntype : '');

                    //currentMethod.returntype = (returnTypeName !== '' ? this.nameHash[returnTypeName] : currentMethod.returntype);

                    var returnTypeNode = this.nameHash[returnTypeName];

                    if (returnTypeNode) {
                        switch (returnTypeNode) {
                            case 'namespace':
                                currentMethod.returntypenamespace = returnTypeNode;
                                break;
                            case 'class':
                                currentMethod.returntypeclass = returnTypeNode;
                                break;
                            case 'interface':
                                currentMethod.returntypeinterface = returnTypeNode;
                                break;
                        }
                    }

                    ds.findNode(currentMethod, (node) => {
                        parent = node;
                        currentMethod.parent = parent;

                        for (var j in currentMethod.parameters) {
                            var param: types.IParameterNode = currentMethod.parameters[j],
                                resolvedType: types.INode = null;
                            if (param.type) {
                                resolvedType = this.nameHash[param.type];
                            }
                            if (resolvedType) {
                                switch (resolvedType.kind) {
                                    case 'method':
                                        param.methodtype = resolvedType;
                                        break;
                                    case 'class':
                                        param.classtype = resolvedType;
                                        break;
                                    case 'interface':
                                        param.interfacetype = resolvedType;
                                        break;
                                    default:
                                        break;
                                }
                            }
                            param.method = currentMethod;
                            currentMethod.parameters[j] = param;
                        }
                        ds.appendChild(currentMethod, parent);
                    });
                }
            }

            //properties 
            for (var propertyNode in flat.properties) {
                var currentProperty = flat.properties[propertyNode],
                    parent = null;

                ds.findNode(currentProperty, (node) => {
                    parent = node;
                    currentProperty.parent = parent;
                    ds.appendChild(currentProperty, parent);
                });
            }

            //events
            for (var eventNode in flat.events) {
                var currentEvent = flat.events[eventNode],
                    parent = null;

                ds.findNode(currentEvent, (node) => {
                    parent = node;
                    currentEvent.parent = parent;
                    ds.appendChild(currentMethod, parent);
                });
            }

            callback(ds.graph);
        };
    }
}

/* 
 * Used for debugging.
 */
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