/// <reference path="../_references.ts" />

/*
 * Global Data Strucutres
 */

import tagBuilder = require('../tags/tagbuilder');

import methodhandler = require('../nodehandlers/method.handler');
import propertyhandler = require('../nodehandlers/property.handler');
import classhandler = require('../nodehandlers/class.handler');
import interfacehandler = require('../nodehandlers/interface.handler');
import eventhandler = require('../nodehandlers/event.handler');
import namespacehandler = require('../nodehandlers/namespace.handler');
import utils = require('../utils/utils');

import NamespaceGraphHandler = require('../generator/graphhandlers/namespace.graphhandler');
import InterfaceGraphHandler = require('../generator/graphhandlers/interface.graphhandler');
import ClassGraphHandler = require('../generator/graphhandlers/class.graphhandler');
import MethodGraphHandler = require('../generator/graphhandlers/method.graphhandler');
import PropertyGraphHandler = require('../generator/graphhandlers/property.graphhandler');
import EventGraphHandler = require('../generator/graphhandlers/event.graphhandler');

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
    [index: string]: INameSpaceNode
} = {};

/*
 * flat
 * An array of nodes stored by their 'kind'.
 */
export var flat: {
    namespaces: { [name: string]: INameSpaceNode };
    interfaces: { [name: string]: IInterfaceNode };
    classes: { [name: string]: IClassNode };
    methods: { [name: string]: Array<IMethodNode> };
    properties: { [name: string]: IPropertyNode };
    parameters: { [name: string]: IParameterNode };
    events: { [name: string]: IEvent };
} = {
        namespaces: {},
        interfaces: {},
        classes: {},
        methods: {},
        parameters: {},
        properties: {},
        events: {}
};

export var findNode = (node: INode, callback: (node: any) => void) => {
    if (!nameHashTable[node.memberof]) {
        throw new Error(node.memberof + ' not found! Node: ' + node.name_);
    }
    callback(nameHashTable[node.memberof]);
};

export var appendChild = (childNode: INode, parentNode: INode): void => {
    var parent = parentNode;

    var name = (childNode.kind === 'method') ? childNode.name_.toUpperCase() : childNode.name_;

    parent[name] = childNode;
};

export var populateFlat = (tags: any): void => {
    utils.forEach(tags, (value, k, obj) => {

        // tmpObj stores the tags in an object so they can be referenced by name.
        var parsedDocTags: IParsedDocNode = tagBuilder.buildTags(tags[k]);


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
                    console.log('event: ' + parsedDocTags);
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
    var graphHandlers: Array<IGraphHandler> = [];

    graphHandlers.push(new NamespaceGraphHandler(flat.namespaces));
    graphHandlers.push(new InterfaceGraphHandler(flat.interfaces));
    graphHandlers.push(new ClassGraphHandler(flat.classes));
    graphHandlers.push(new MethodGraphHandler(flat.methods));
    graphHandlers.push(new PropertyGraphHandler(flat.properties));
    graphHandlers.push(new EventGraphHandler(flat.events));

    utils.forEach(graphHandlers, (v, k, o) => {
        v.handleGraphNodes();
    });

};