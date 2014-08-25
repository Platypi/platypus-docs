/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

import DocNodeTypes = require('./docnodes');
var parser = require('comment-parser');

export module DocGen {
    
    /**
     * Generate Docs from source file.
     */
    export class DocGenerator {

        nameHash = {};

        fromFile = (filename: string) => {
            parser.file(filename, this.parsedCommentsHandler);
        };

        parsedCommentsHandler = (err: any, data: any) => {
            if (!err) {
                this.__treeGen(data, this.treeHandler);
            } else {
                console.log(new Error(err));
            }
        };


        treeHandler = (tree: any) => {
            console.log(JSON.stringify(tree, censor(tree), 4));
        };

        /**
         * Return a node by its fully qualified name
         * If a node is not found the deepest node found will be returned.
         */
        private __findNode = (node: DocNodeTypes.INode, tree: any, callback: (node: any) => void) => {
            var names = node.memberof.toLowerCase().split('.'),
                current = names.shift(),
                deepest = tree,
                container = null;

            while (!!current) {
                if (deepest[current]) {
                    deepest = deepest[current];
                    current = names.shift();
                } else if (this.nameHash[node.memberof]) {
                    return callback(this.nameHash[node.memberof]);
                } else {
                    // can't go any deeper
                    //console.log(JSON.stringify(this.nameHash,censor(this.nameHash),4));
                    throw new Error(node.name + '\'s parent cannot be found, looked for: ' + node.memberof);
                }
            }

            callback(deepest);
        };

        /**
         * Generate a tree structure of tags as they appear in code.
         */
        private __treeGen = (tags: any, callback: (tree: any) => void) => {
            var tree: {
                [index: string]: DocNodeTypes.INameSpaceNode
            } = {};

            /*
             * First run through will generate a flat 
             * data structure as we may not yet have all the tags
             * need to reference each other in memory.
             */
            var flat: {
                namespaces: { [name: string]: DocNodeTypes.INameSpaceNode };
                interfaces: { [name: string]: DocNodeTypes.IInterfaceNode };
                classes: { [name: string]: DocNodeTypes.IClassNode };
                methods: { [name:string]: Array<DocNodeTypes.IMethodNode> };
                properties: { [name: string]: DocNodeTypes.IPropertyNode };
                parameters: { [name: string]: DocNodeTypes.IParameterNode };
                events: {[name:string]: DocNodeTypes.IEvent};
            } = {
                namespaces: {},
                interfaces: {},
                classes: {},
                methods: {},
                parameters: {},
                properties: {},
                events: {}
            };

            /**
             * Two loops are needed as the output of the parser 
             * results in nested tags.
             */
            for (var k in tags) {

                // tmpObj stores the tags in an object so they can be referenced by name.
                var tmpObj: any = {};

                for (var l in tags[k].tags) {
                    var t = tags[k].tags[l];

                    // There can be multiple params for a given comment.
                    if (t.tag !== 'param') {
                        tmpObj[t.tag] = t;
                    } else {
                        if (tmpObj.params) {
                            (<Array<ITag>> tmpObj.params).push(t);
                        } else {
                            tmpObj.params = new Array<ITag>();
                            tmpObj.params.push(t);
                        }
                    }

                    // There can be multiple interfaces that a class implements
                    if (t.tag !== 'implements') {
                        tmpObj[t.tag] = t;
                    } else {
                        tmpObj.implements = new Array<ITag>();
                        tmpObj.implements.push(t);
                    }
                }

                if (tmpObj.kind) {
                    var kind: string = (<string>tmpObj.kind.name).trim().toLowerCase(),
                        memberof: string = (tmpObj.memberof ? (<string>tmpObj.memberof.name).trim().toLowerCase() : '');

                    switch (kind) {
                        case 'function':
                            // if name is blank, the method is an interface
                            //var member = tree[memberof];
                            var newMethod: DocNodeTypes.IMethodNode = {
                                name: (tmpObj.name ? tmpObj.name.name : ''),
                                description: tmpObj.description.descrption,
                                kind: tmpObj.kind.name,
                                overrides: (tmpObj.variation ? true : false),
                                visibility: (tmpObj.access ? tmpObj.access.name : 'public'),
                                static: (tmpObj.static ? true : false),
                                remarks: tmpObj.remarks,
                                exported: (!tmpObj.exported ? true : false),
                                typeparamaters: (tmpObj.typeparam ? tmpObj.typeparam.name : ''),
                                returntype: (tmpObj.returns ? tmpObj.returns.type : ''),
                                returntypedesc: (tmpObj.returns ? tmpObj.returns.name + ' ' + tmpObj.returns.description : ''),
                                optional: (tmpObj.optional ? true : false),
                                parameters: {},
                                published: true,
                                memberof: memberof
                            };

                            // push the params onto the tmpObj
                            if (tmpObj.params) {
                                for (var z = 0; z < tmpObj.params.length; z++) {
                                    var newParameter: DocNodeTypes.IParameterNode = {
                                        name: tmpObj.params[z].name,
                                        kind: tmpObj.params[z].kind,
                                        description: tmpObj.params[z].description,
                                        published: true,
                                        exported: (!tmpObj.exported ? true : false),
                                    };
                                    newMethod.parameters[newParameter.name] = newParameter;
                                    //newMethod.parameters.push(newParameter);
                                }
                            }

                            var methodName = (newMethod.name !== '') ? newMethod.name : '()';

                            if (!(flat.methods[methodName] instanceof Array)) {
                                flat.methods[methodName] = [];
                            }

                            flat.methods[methodName].push(newMethod);
                            
                            break;
                        case 'property':
                            var newProperty: DocNodeTypes.IPropertyNode = {
                                name: tmpObj.name.name,
                                description: tmpObj.description.description,
                                kind: tmpObj.kind.name,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                visibility: (tmpObj.access ? tmpObj.access.name : 'public'),
                                //interface
                                //namespace
                                //class
                                type: tmpObj.type.type,
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                static: (tmpObj.static ? true : false),
                                readonly: (tmpObj.readonly ? true : false),
                                optional: (tmpObj.optional ? true : false),
                                memberof: memberof
                            };

                            flat.properties[newProperty.name] = newProperty;

                            break;
                        case 'class':
                            var newClass: DocNodeTypes.IClassNode = {
                                name: tmpObj.name.name,
                                description: tmpObj.description.description,
                                kind: tmpObj.kind.name,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                visibility: (tmpObj.access ? tmpObj.access.name : 'public'),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                parent: (tmpObj['extends'] ? tmpObj['extends'].type : ''),
                                namespace: (tmpObj.namespace ? tmpObj.namespace.type : ''),
                                interfaces: {},
                                memberof: memberof
                            };

                            //interfaces (implements) treat like params
                            if (tmpObj.implements) {
                                for (var k in tmpObj.implements) {
                                    var tag = tmpObj.implements[k],
                                        newInterface: DocNodeTypes.IInterfaceNode = {
                                            name: tag.type,
                                            kind: 'interface'
                                        };
                                    newClass.interfaces[newInterface.name] = newInterface;
                                }
                            }

                            flat.classes[newClass.name] = newClass;
                            
                            break;
                        case 'interface':
                            var newInterface: DocNodeTypes.IInterfaceNode = {
                                name: tmpObj.name.name,
                                kind: tmpObj.kind.name,
                                description: tmpObj.description.description,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                visibility: (tmpObj.access ? tmpObj.access.name : 'public'),
                                exported: (!tmpObj.exported ? true : tmpObj.exported.name !== 'false'),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                //methods,
                                memberof: memberof
                            };
                            flat.interfaces[newInterface.name] = newInterface;
                            
                            break;
                        case 'event':
                            var newEvent: DocNodeTypes.IEvent = {
                                name: tmpObj.name.name,
                                kind: tmpObj.kind.name,
                                description: tmpObj.description.description,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                visibility: (tmpObj.access ? tmpObj.access.name : 'public'),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                //class @class
                                class: tmpObj.class.name,
                                memberof: memberof
                            };

                            flat.events[newEvent.name] = newEvent;
                            
                            break;
                        case 'namespace':
                            var newNamespace: DocNodeTypes.INameSpaceNode = {
                                name: tmpObj.name.name,
                                kind: tmpObj.kind.name,
                                description: tmpObj.description.description,
                                visibility: (tmpObj.access ? tmpObj.access.name : 'public'),
                                published: (!tmpObj.published ? true : tmpObj.published),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                memberof: memberof
                            };

                            flat.namespaces[newNamespace.name] = newNamespace;
                            
                            break;
                    }

                    // start building the tree with namespaces
                    for (var namespace in flat.namespaces) {
                        var currentNamespace = flat.namespaces[namespace],
                            parent = null;

                        if (currentNamespace.memberof) {
                            this.__findNode(currentNamespace, tree, (node) => {
                                parent = node;
                                currentNamespace.parent = parent;
                                this.__appendChild(currentNamespace, parent);
                            });
                        } else {
                            tree[currentNamespace.name] = currentNamespace;
                        }
                    }

                    //interfaces
                    for (var interfaceNode in flat.interfaces) {
                        var currentInterface = flat.interfaces[interfaceNode],
                            parent = null;

                        this.__findNode(currentInterface, tree, (node) => {
                            parent = node;
                            this.__appendChild(currentInterface, parent);
                        });
                    }

                    //classes
                    for (var classNode in flat.classes) {
                        var currentClass = flat.classes[classNode],
                            parent = null;

                        this.__findNode(currentClass, tree, (node) => {
                            parent = node;

                            for (var i in currentClass.interfaces) {
                                currentClass.interfaces[i] = this.nameHash[currentClass.interfaces[i].name] || currentClass.interfaces[i];
                            }

                            this.__appendChild(currentClass, parent);
                        });
                    }

                    //methods
                    for (var methodArrayNode in flat.methods) {
                        for (var methodNode in flat.methods[methodArrayNode]) {
                            var currentMethod = flat.methods[methodArrayNode][methodNode],
                                parent = null;

                            this.__findNode(currentMethod, tree, (node) => {
                                parent = node;
                                this.__appendChild(currentMethod, parent);
                            });
                        }
                    }

                    //properties
                    for (var propertyNode in flat.properties) {
                        var currentProperty = flat.properties[propertyNode],
                            parent = null;

                        this.__findNode(currentProperty, tree, (node) => {
                            parent = node;
                            this.__appendChild(currentProperty, parent);
                        });
                    }

                    //events
                    for (var eventNode in flat.events) {
                        var currentEvent = flat.events[eventNode],
                            parent = null;

                        this.__findNode(currentEvent, tree, (node) => {
                            parent = node;
                            this.__appendChild(currentMethod, parent);
                        });
                    }
                }
            }

            callback(tree);
        };

        private __appendChild = (childNode: DocNodeTypes.INode, parentNode: DocNodeTypes.INode): void => {
            var childContainer = this.__nodeContainer(childNode),
                parent = parentNode;

            if (!parentNode[childContainer]) {
                parentNode[childContainer] = {};
            }

            parent[childContainer][childNode.name.toLowerCase()] = childNode;

            var namespacePre = childNode.memberof.toLocaleLowerCase();

            this.nameHash[namespacePre + '.' + childNode.name.toLocaleLowerCase()] = parent[childContainer][childNode.name.toLowerCase()];
        };

        private __nodeContainer = (node: DocNodeTypes.INode) => {
            var containerString = '';

            switch (node.kind) {
                case 'namespace':
                    containerString = 'namespaces';
                    break;
                case 'interface':
                    containerString = 'interfaces';
                    break;
                case 'class':
                    containerString = 'classes';
                    break;
                case 'function':
                    containerString = 'methods';
                    break;
                case 'parameter':
                    containerString = 'parameters';
                    break;
                case 'property':
                    containerString = 'properties';
                    break;
                case 'event':
                    containerString = 'events'
                    break;
            }

            return containerString;
        };

    }

    export interface ITag {
        tag: string;
        name: string;
        type: string;
        description: string;
    }
}

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
            key === 'method') {
            return '[Circular] ' + value.name;
        }

        return value;
    };
}