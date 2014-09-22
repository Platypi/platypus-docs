/*
 * Global Data Strucutres
 */

import types = require('./docnodes');

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