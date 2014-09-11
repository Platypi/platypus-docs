/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

import DocNodeTypes = require('./docnodes');
import fs = require('fs');
var parser = require('comment-parser');

export module DocGen {
    
    /**
     * Generate Docs from source file.
     */
    export class DocGenerator {

        nameHash = {};

        callback = (tree) => { };

        debug = false;

        buildTreeFromFile = (src: string, callback: (tree) => void, debug: boolean = false) => {
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
                this.__treeGen(data, this.__treeHandler);
            } else {
                console.log(new Error(err));
            }
        };


        private __treeHandler = (tree: any) => {
            if (this.debug) {
                console.log(JSON.stringify(tree, censor(tree), 4));
            }

            if (this.callback) {
                this.callback(tree);
            }
        };

        /**
         * Return a node by its fully qualified name
         * If a node is not found the deepest node found will be returned.
         */
        private __findNode = (node: DocNodeTypes.INode, tree: any, callback: (node: any) => void) => {
            if (!this.nameHash[node.memberof]) {
                console.log(JSON.stringify(this.nameHash, censor(this.nameHash), 4));
                throw new Error(node.memberof + ' not found! Node: ' + node.name_);
            }
            callback(this.nameHash[node.memberof]);
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
                var parsedDocTags: ParsedDocNode = this.__buildTags(tags[k]);


                if (parsedDocTags.kind) {
                    var kind: string = (<string>parsedDocTags.kind.name).trim().toLowerCase(),
                        memberof: string = (parsedDocTags.memberof ? (<string>parsedDocTags.memberof.name).trim() : '');

                    switch (kind) {
                        case 'function':
                            // if name is blank, the method is an interface
                            var newMethod: DocNodeTypes.IMethodNode = {
                                name_: (parsedDocTags.name ? parsedDocTags.name.name : ''),
                                description_: parsedDocTags.description.description,
                                //kind: parsedDocTags.kind.name,
                                kind: 'method',
                                overrides: (parsedDocTags.variation ? true : false),
                                visibility: (parsedDocTags.access ? parsedDocTags.access.name : 'public'),
                                static: (parsedDocTags.static ? true : false),
                                remarks: (parsedDocTags.remarks ? parsedDocTags.remarks.description : ''),
                                published: (!parsedDocTags.published ? true : (parsedDocTags.published.name !== 'false')),
                                exported: (!parsedDocTags.exported ? true : (parsedDocTags.exported.name !== 'false')),
                                typeparamaters: (parsedDocTags.typeparam ? parsedDocTags.typeparam.name : ''),
                                returntype: (parsedDocTags.returns ? parsedDocTags.returns.type : ''),
                                returntypedesc: (parsedDocTags.returns ? parsedDocTags.returns.name + ' ' + parsedDocTags.returns.description : ''),
                                optional: (parsedDocTags.optional ? true : false),
                                parameters: {},
                                memberof: memberof
                            };

                            // push the params onto the tmpObj
                            if (parsedDocTags.params) {
                                for (var z = 0; z < parsedDocTags.params.length; z++) {
                                    var newParameter: DocNodeTypes.IParameterNode = {
                                        name_: parsedDocTags.params[z].name + '_',
                                        memberof: parsedDocTags.params[z].memberof,
                                        kind: parsedDocTags.params[z].kind,
                                        description_: parsedDocTags.params[z].description.description,
                                        published: true,
                                        exported: (!parsedDocTags.exported ? true : false),
                                    };
                                    newMethod.parameters[newParameter.name_ + '_'] = newParameter;
                                }
                            }

                            var methodName = (newMethod.name_ !== '') ? memberof.toUpperCase() + '.' + newMethod.name_.toUpperCase() : '()';

                            if (!(flat.methods[methodName] instanceof Array)) {
                                flat.methods[methodName] = [];
                            }

                            flat.methods[methodName].push(newMethod);
                            this.nameHash[methodName] = flat.methods[methodName];
                            
                            break;
                        case 'property':
                            var newProperty: DocNodeTypes.IPropertyNode = {
                                name_: parsedDocTags.name.name,
                                description_: parsedDocTags.description.description,
                                kind: parsedDocTags.kind.name,
                                published: (!parsedDocTags.published ? true : (parsedDocTags.published.name !== 'false')),
                                exported: (!parsedDocTags.exported ? true : (parsedDocTags.exported.name !== 'false')),
                                visibility: (parsedDocTags.access ? parsedDocTags.access.name : 'public'),
                                type: parsedDocTags.type.type,
                                remarks: (parsedDocTags.remarks ? parsedDocTags.remarks.description : ''),
                                static: (parsedDocTags.static ? true : false),
                                readonly: (parsedDocTags.readonly ? true : false),
                                optional: (parsedDocTags.optional ? true : false),
                                memberof: memberof
                            };

                            var propertyName = memberof + '.' + newProperty.name_;

                            flat.properties[propertyName] = newProperty;
                            this.nameHash[propertyName] = flat.properties[propertyName];

                            break;
                        case 'class':
                            var newClass: DocNodeTypes.IClassNode = {
                                name_: parsedDocTags.name.name,
                                description_: parsedDocTags.description.description,
                                kind: parsedDocTags.kind.name,
                                published: (!parsedDocTags.published ? true : (parsedDocTags.published.name !== 'false')),
                                exported: (!parsedDocTags.exported ? true : (parsedDocTags.exported.name !== 'false')),
                                visibility: (parsedDocTags.access ? parsedDocTags.access.name : 'public'),
                                remarks: (parsedDocTags.remarks ? parsedDocTags.remarks.description : ''),
                                parentString: (parsedDocTags.extends && parsedDocTags.extends[0] ? parsedDocTags.extends[0].type : ''),
                                namespaceString: memberof,
                                interfaces: {},
                                memberof: memberof
                            };

                            //interfaces (implements) treat like params
                            if (parsedDocTags.implements) {
                                for (var k in parsedDocTags.implements) {
                                    var tag = parsedDocTags.implements[k],
                                        newInterface: DocNodeTypes.IInterfaceNode = {
                                            name_: tag.type,
                                            kind: 'interface'
                                        };

                                    newClass.interfaces[newInterface.name_] = newInterface;
                                }
                            }

                            var className = memberof + '.' + newClass.name_;

                            flat.classes[className] = newClass;
                            this.nameHash[className] = flat.classes[className];
                            
                            break;
                        case 'interface':
                            var newInterface: DocNodeTypes.IInterfaceNode = {
                                name_: parsedDocTags.name.name,
                                kind: parsedDocTags.kind.name,
                                description_: parsedDocTags.description.description,
                                visibility: (parsedDocTags.access ? parsedDocTags.access.name : 'public'),
                                published: (!parsedDocTags.published ? true : (parsedDocTags.published.name !== 'false')),
                                exported: (!parsedDocTags.exported ? true : (parsedDocTags.exported.name !== 'false')),
                                remarks: (parsedDocTags.remarks ? parsedDocTags.remarks.description : ''),
                                //methods,
                                memberof: memberof,
                                interfaces: {}
                            };

                            //interfaces (extends) treat like params
                            if (parsedDocTags.extends) {
                                for (var k in parsedDocTags.extends) {
                                    var tag = parsedDocTags.extends[k],
                                        newExtends: DocNodeTypes.IInterfaceNode = {
                                            name_: tag.type,
                                            kind: 'interface'
                                        };

                                    newInterface.interfaces[newExtends.name_] = newExtends;
                                }
                            }

                            var interfaceName = memberof + '.' + newInterface.name_;

                            flat.interfaces[interfaceName] = newInterface;
                            this.nameHash[interfaceName] = flat.interfaces[interfaceName];
                            
                            break;
                        case 'event':
                            var newEvent: DocNodeTypes.IEvent = {
                                name_: parsedDocTags.name.name,
                                kind: parsedDocTags.kind.name,
                                description_: parsedDocTags.description.description,
                                published: (!parsedDocTags.published ? true : (parsedDocTags.published.name !== 'false')),
                                exported: (!parsedDocTags.exported ? true : (parsedDocTags.exported.name !== 'false')),
                                visibility: (parsedDocTags.access ? parsedDocTags.access.name : 'public'),
                                remarks: (parsedDocTags.remarks ? parsedDocTags.remarks.description : ''),
                                classNameString: parsedDocTags.class.name,
                                memberof: memberof
                            };

                            var eventName = memberof + '.' + newEvent.name_;

                            flat.events[eventName] = newEvent;
                            this.nameHash[eventName] = flat.events[eventName];
                            
                            
                            break;
                        case 'namespace':
                            var newNamespace: DocNodeTypes.INameSpaceNode = {
                                name_: parsedDocTags.name.name,
                                kind: parsedDocTags.kind.name,
                                description_: parsedDocTags.description.description,
                                visibility: (parsedDocTags.access ? parsedDocTags.access.name : 'public'),
                                published: (!parsedDocTags.published ? true : (parsedDocTags.published.name !== 'false')),
                                exported: (!parsedDocTags.exported ? true : (parsedDocTags.exported.name !== 'false')),
                                remarks: (parsedDocTags.remarks ? parsedDocTags.remarks.description : ''),
                                memberof: memberof
                            };

                            var namespaceName = '';

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

            // start building the tree with namespaces
            for (var namespace in flat.namespaces) {
                var currentNamespace = flat.namespaces[namespace],
                    parent = null;

                if (currentNamespace.memberof) {
                    this.__findNode(currentNamespace, tree, (node) => {
                        parent = node;
                        currentNamespace.parent = parent;

                        if (!parent) {
                            return;
                        }

                        this.__appendChild(currentNamespace, parent);
                    });
                } else {
                    tree[currentNamespace.name_] = currentNamespace;
                }
            }
            //interfaces
            for (var interfaceNode in flat.interfaces) {
                var currentInterface = flat.interfaces[interfaceNode],
                    parent = null;

                this.__findNode(currentInterface, tree, (node) => {
                    parent = node;
                    currentInterface.parent = parent;

                    for (var i in currentInterface.interfaces) {
                        currentInterface.interfaces[i] = this.nameHash[currentInterface.interfaces[i].name_] || currentInterface.interfaces[i];
                    }

                    this.__appendChild(currentInterface, parent);
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

                this.__appendChild(currentClass, parent);
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

                    this.__findNode(currentMethod, tree, (node) => {
                        parent = node;
                        currentMethod.parent = parent;

                        for (var j in currentMethod.parameters) {
                            currentMethod.parameters[j] = this.nameHash[(<string>currentMethod.parameters[j].name_)] || currentMethod.parameters[j];
                            currentMethod.parameters[j].method = currentMethod;
                        }

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
                    currentProperty.parent = parent;
                    this.__appendChild(currentProperty, parent);
                });
            }

            //events
            for (var eventNode in flat.events) {
                var currentEvent = flat.events[eventNode],
                    parent = null;

                this.__findNode(currentEvent, tree, (node) => {
                    parent = node;
                    currentEvent.parent = parent;
                    this.__appendChild(currentMethod, parent);
                });
            }

            callback(tree);
        };

        private __appendChild = (childNode: DocNodeTypes.INode, parentNode: DocNodeTypes.INode): void => {
            var childContainer = this.__nodeContainer(childNode),
                parent = parentNode;

            if (!parent) {
                console.log(childNode.memberof);
            }

            var name = (childNode.kind === 'method') ? childNode.name_.toUpperCase() : childNode.name_;

            parent[name] = childNode;

            var namespacePre = childNode.memberof;

            // old way of populating namehash
            //this.nameHash[namespacePre + '.' + name] = childNode;
        };

        private __buildTags = (tag: any): ParsedDocNode => {
            var tmpObj: any = {};

            for (var l in tag.tags) {
                var t = tag.tags[l];

                // There can be multiple params/implements/extends/typeparams for a given comment.
                if (t.tag === 'param') {
                    if (!tmpObj.params) {
                        tmpObj.params = new Array<ITag>();
                    }
                    tmpObj.params.push(t);
                } else if (t.tag === 'typeparam') {
                    if (!tmpObj.typeparams) {
                        tmpObj.typeparams = new Array<ITag>();
                    }
                    tmpObj.typeparams.push(t);
                } else if (t.tag === 'implements') {
                    if (!tmpObj.implements) {
                        tmpObj.implements = new Array<ITag>();
                    }
                    tmpObj.implements.push(t);
                } else if (t.tag === 'extends') {
                    if (!tmpObj.extends) {
                        tmpObj.extends = new Array<ITag>();
                    }
                    tmpObj.extends.push(t);
                } else {
                    tmpObj[t.tag] = t;
                }
            }

            return tmpObj;
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

    export interface ParsedDocNode {
        name?: ITag;
        kind?: ITag;
        memberof?: ITag;
        description?: ITag;
        variation: ITag;
        access?: ITag;
        static?: ITag;
        remarks?: ITag;
        published?: ITag;
        exported?: ITag;
        typeparm?: ITag;
        returns?: ITag;
        optional?: ITag;
        params?: Array<any>;
        typeparam?: ITag;
        implements?: Array<any>;
        type?: ITag;
        readonly?: ITag;
        namespace?: ITag;
        extends?: Array<any>;
        class?: ITag;
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