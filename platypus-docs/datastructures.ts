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