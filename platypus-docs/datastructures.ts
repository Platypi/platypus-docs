﻿/*
 * Global Data Strucutres
 */

import types = require('./docnodes');
import tagBuilder = require('./tagbuilder');

import methodhandler = require('./nodehandlers/method.handler');
import propertyhandler = require('./nodehandlers/property.handler');
import classhandler = require('./nodehandlers/class.handler');
import interfacehandler = require('./nodehandlers/interface.handler');
import eventhandler = require('./nodehandlers/event.handler');
import namespacehandler = require('./nodehandlers/namespace.handler');

/*
 * nameHashTable
 * Used to lookup nodes by their fully qualified name.
 */
export var nameHashTable = {};

/*
 * graph
 * The actual graph that is traversed and stored in the database.
 */
export var graph: {
    [index: string]: types.INameSpaceNode
} = {};

/*
 * flat
 * An array of nodes stored by their 'kind'.
 */
export var flat: {
    namespaces: { [name: string]: types.INameSpaceNode };
    interfaces: { [name: string]: types.IInterfaceNode };
    classes: { [name: string]: types.IClassNode };
    methods: { [name: string]: Array<types.IMethodNode> };
    properties: { [name: string]: types.IPropertyNode };
    parameters: { [name: string]: types.IParameterNode };
    events: { [name: string]: types.IEvent };
} = {
        namespaces: {},
        interfaces: {},
        classes: {},
        methods: {},
        parameters: {},
        properties: {},
        events: {}
};

export var findNode = (node: types.INode, callback: (node: any) => void) => {
    if (!nameHashTable[node.memberof]) {
        throw new Error(node.memberof + ' not found! Node: ' + node.name_);
    }
    callback(nameHashTable[node.memberof]);
};

export var appendChild = (childNode: types.INode, parentNode: types.INode): void => {
    var parent = parentNode;

    var name = (childNode.kind === 'method') ? childNode.name_.toUpperCase() : childNode.name_;

    parent[name] = childNode;
};

export var populateFlat(tags: any) {
    for (var k in tags) {

        // tmpObj stores the tags in an object so they can be referenced by name.
        var parsedDocTags: tagBuilder.ParsedDocNode = tags.buildTags(tags[k]);


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
                    nameHashTable[methodName] = flat.methods[methodName];

                    break;
                case 'property':
                    var newProperty = propertyhandler.MakeNewPropertyNode(parsedDocTags),
                        propertyName = newProperty.memberof + '.' + newProperty.name_;

                    flat.properties[propertyName] = newProperty;
                    nameHashTable[propertyName] = flat.properties[propertyName];

                    break;
                case 'class':
                    var newClass = classhandler.MakeNewClassNode(parsedDocTags),
                        className = newClass.memberof + '.' + newClass.name_;

                    flat.classes[className] = newClass;
                    nameHashTable[className] = flat.classes[className];

                    break;
                case 'interface':
                    var newInterface = interfacehandler.MakeNewInterfaceNode(parsedDocTags),
                        interfaceName = newInterface.memberof + '.' + newInterface.name_;

                    flat.interfaces[interfaceName] = newInterface;
                    nameHashTable[interfaceName] = flat.interfaces[interfaceName];

                    break;
                case 'event':
                    var newEvent = eventhandler.MakeNewEventNode(parsedDocTags),
                        eventName = newEvent.memberof + '.' + newEvent.name_;

                    flat.events[eventName] = newEvent;
                    nameHashTable[eventName] = flat.events[eventName];

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
                    nameHashTable[namespaceName] = flat.namespaces[namespaceName];

                    break;
            }
        }
    }
};

export var flat2Graph = () => {
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

                appendChild(currentNamespace, parent);
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
                currentInterface.interfaces[i] = nameHashTable[currentInterface.interfaces[i].name_] || currentInterface.interfaces[i];
            }

            appendChild(currentInterface, parent);
        });
    }

    //classes
    for (var classNode in flat.classes) {
        var currentClass = flat.classes[classNode],
            parent = null;

        currentClass.namespace = nameHashTable[currentClass.namespaceString];
        currentClass.extends = nameHashTable[currentClass.parentString];

        parent = currentClass.parent = currentClass.namespace;

        for (var i in currentClass.interfaces) {
            currentClass.interfaces[i] = nameHashTable[currentClass.interfaces[i].name_] || currentClass.interfaces[i];
        }

        appendChild(currentClass, parent);
    }

    //methods
    for (var methodArrayNode in flat.methods) {
        for (var methodNode in flat.methods[methodArrayNode]) {
            var currentMethod = flat.methods[methodArrayNode][methodNode],
                parent = null,
                returnTypeName = (typeof currentMethod.returntype === 'string' ? currentMethod.returntype : '');

            //currentMethod.returntype = (returnTypeName !== '' ? nameHashTable[returnTypeName] : currentMethod.returntype);

            var returnTypeNode = nameHashTable[returnTypeName];

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
                        resolvedType = nameHashTable[param.type];
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
                appendChild(currentMethod, parent);
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
            appendChild(currentProperty, parent);
        });
    }

    //events
    for (var eventNode in flat.events) {
        var currentEvent = flat.events[eventNode],
            parent = null;

        ds.findNode(currentEvent, (node) => {
            parent = node;
            currentEvent.parent = parent;
            appendChild(currentMethod, parent);
        });
    }
};