import types = require('./docnodes');

export var nameHashTable = {};

export var graph: {
    [index: string]: types.INameSpaceNode
} = {};

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