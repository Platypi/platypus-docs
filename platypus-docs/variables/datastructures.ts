/*
 * Global Data Strucutres
 */

import types = require('../docnodes');
import tagBuilder = require('../tags/tagbuilder');

import methodhandler = require('../nodehandlers/method.handler');
import propertyhandler = require('../nodehandlers/property.handler');
import classhandler = require('../nodehandlers/class.handler');
import interfacehandler = require('../nodehandlers/interface.handler');
import eventhandler = require('../nodehandlers/event.handler');
import namespacehandler = require('../nodehandlers/namespace.handler');
import utils = require('../utils/utils');

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

export var populateFlat = (tags: any): void => {

    utils.forEach(tags, (value, k, obj) => {

        // tmpObj stores the tags in an object so they can be referenced by name.
        var parsedDocTags: tagBuilder.ParsedDocNode = tagBuilder.buildTags(tags[k]);


        if (parsedDocTags.kind) {
            var kind: string = (<string>parsedDocTags.kind.name).trim().toLowerCase();

            switch (kind) {
                case 'function':
                    var newMethod = methodhandler.MakeNewMethodNode(parsedDocTags),
                        methodName = (newMethod.name_ !== '') ? newMethod.memberof.toUpperCase()
                        + '.' + newMethod.name_.toUpperCase() : '()';

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
    });
};

export var flat2Graph = () => {
    // start building the graph with namespaces
    utils.forEach(flat.namespaces, (namespaceValue, namespaceKey, namespaceObj) => {
        var currentNamespace: types.INameSpaceNode = flat.namespaces[namespaceKey];

        parent = null;

        if (currentNamespace.memberof) {
            findNode(currentNamespace, (node) => {
                var parent = node;
                currentNamespace.parent = parent;

                if (!parent) {
                    return;
                }

                appendChild(currentNamespace, parent);
            });
        } else {
            graph[currentNamespace.name_] = currentNamespace;
        }
    });
    // interfaces
    utils.forEach(flat.interfaces, (interfaceValue, interfaceKey, interfaceObj) => {
        var currentInterface = flat.interfaces[interfaceKey];

        parent = null;

        findNode(currentInterface, (node) => {
            var parent = node;
            currentInterface.parent = parent;

            var subinterfaceKeys = Object.keys(currentInterface.interfaces);
            for (var subinterfaceNum = 0; subinterfaceNum < subinterfaceKeys.length; subinterfaceNum++) {
                var subinterface: types.IInterfaceNode = currentInterface.interfaces[subinterfaceKeys[subinterfaceNum]];
                currentInterface.interfaces[subinterfaceKeys[subinterfaceNum]] = nameHashTable[subinterface.name_] || subinterface;
            }

            appendChild(currentInterface, parent);
        });
    });

    // classes
    utils.forEach(flat.classes, (classValue, classKey, classObj) => {
        var currentClass = flat.classes[classKey];

        var parent = null;

        currentClass.namespace = nameHashTable[currentClass.namespaceString];
        currentClass.extends = nameHashTable[currentClass.parentString];

        parent = currentClass.parent = currentClass.namespace;

        var subInterfaceKeys = Object.keys(currentClass.interfaces);
        for (var subInterfaceNum = 0; subInterfaceNum < subInterfaceKeys.length; subInterfaceNum++) {
            var currentSubInterface: types.IInterfaceNode = currentClass.interfaces[subInterfaceKeys[subInterfaceNum]];
            currentClass.interfaces[subInterfaceKeys[subInterfaceNum]] = nameHashTable[currentSubInterface.name_]
            || currentClass.interfaces[subInterfaceKeys[subInterfaceNum]];
        }

        appendChild(currentClass, parent);
    });

    // methods
    utils.forEach(flat.methods, (value, key, obj) => {
        utils.forEach(flat.methods[key], (v, k, o) => {
            var currentMethod = flat.methods[key][k],
                returnTypeName = (typeof currentMethod.returntype === 'string' ? currentMethod.returntype : '');

            parent = null;


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

            findNode(currentMethod, (node) => {
                var parent = node;
                currentMethod.parent = parent;

                var parameterKeys = Object.keys(currentMethod.parameters);
                for (var p = 0; p < parameterKeys.length; p++) {
                    var param: types.IParameterNode = currentMethod.parameters[parameterKeys[p]],
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
                    currentMethod.parameters[parameterKeys[p]] = param;
                }
                appendChild(currentMethod, parent);
            });
        });
    });

    // properties 
    utils.forEach(flat.properties, (value, key, obj) => {
        var currentProperty = flat.properties[key],
            parent = null;

        findNode(currentProperty, (node) => {
            parent = node;
            currentProperty.parent = parent;
            appendChild(currentProperty, parent);
        });
    });

    // events
    utils.forEach(flat.events, (eventValue, eventKey, eventObj) => {
        var currentEvent = flat.events[eventKey];

        var parent = null;

        findNode(currentEvent, (node) => {
            parent = node;
            currentEvent.parent = parent;
            appendChild(currentEvent, parent);
        });
    });
};