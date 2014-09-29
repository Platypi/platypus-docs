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

/*
 * Attempts to find the 'memberof' node for the given node.
 * 
 * @param node The node you want to find the corresponding memberof node for.
 * @param callback The Function you wish to execute with the result.
 */
export var findNode = (node: INode, callback: (node: any) => void) => {
    if (!nameHashTable[node.memberof]) {
        throw new Error(node.memberof + ' not found! Node: ' + node.name_);
    }
    callback(nameHashTable[node.memberof]);
};

/*
 * Appends the child node to the parent node.
 * 
 * @param childNode The node you wish to append to the parent.
 * @param parentNode The node you wish to append the child to.
 */
export var appendChild = (childNode: INode, parentNode: INode): void => {
    var parent = parentNode;

    var name = (childNode.kind === 'method') ? childNode.name_.toUpperCase() : childNode.name_;

    parent[name] = childNode;
};

/*
 * Populates the 'flat' array data structure with the given tags from the pareser.
 * 
 * @param tags Parsed tags returned from the parser.
 */
export var populateFlat = (tags: any): void => {
    utils.forEach(tags, (value, k, obj) => {

        // tmpObj stores the tags in an object so they can be referenced by name.
        var parsedDocTags: IParsedDocNode = tagBuilder.buildTags(tags[k]);

        if (parsedDocTags.kind) {
            var kind: string = (<string>parsedDocTags.kind.name).trim().toLowerCase();

            if (kind === 'function') {
                methodhandler.addToDataStructures(parsedDocTags);
            } else if (kind === 'property') {
                propertyhandler.addToDataStructures(parsedDocTags);
            } else if (kind === 'class') {
                classhandler.addToDataStructures(parsedDocTags);
            } else if (kind === 'interface') {
                interfacehandler.addToDataStructures(parsedDocTags);
            } else if (kind === 'event') {
                eventhandler.addToDataStructures(parsedDocTags);
            } else if (kind === 'namespace') {
                namespacehandler.addToDataStructures(parsedDocTags);
            }

        }
    });
};

/*
 * Converts the flat array data structure to a graph structure.
 */
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