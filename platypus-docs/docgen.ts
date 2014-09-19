/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

/*
 * DocGen
 * Generates the document graph.
 */

import DocNodeTypes = require('./docnodes');
import fs = require('fs');
import ds = require('./datastructures');
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
         * Return a node by its fully qualified name
         * If a node is not found the deepest node found will be returned.
         */
        private __findNode = (node: DocNodeTypes.INode, graph: any, callback: (node: any) => void) => {
            if (!this.nameHash[node.memberof]) {
                console.log(JSON.stringify(this.nameHash, censor(this.nameHash), 4));
                throw new Error(node.memberof + ' not found! Node: ' + node.name_);
            }
            callback(this.nameHash[node.memberof]);
        };

        /**
         * Generate a graph of tags as they appear in code.
         */
        private __graphGen = (tags: any, callback: (graph: any) => void) => {
            var graph = ds.graph;

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
                                //typeparamaters: (parsedDocTags.typeparams ? parsedDocTags.typeparams.name : ''),
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
                                        name_: parsedDocTags.params[z].name,
                                        memberof: parsedDocTags.params[z].memberof,
                                        kind: 'parameter',
                                        type: parsedDocTags.params[z].type,
                                        description_: parsedDocTags.params[z].description,
                                        published: true,
                                        exported: (!parsedDocTags.exported ? true : false),
                                    };

                                    // determine if the parameter is optional 
                                    if (newParameter.name_.indexOf('?') > 0) {
                                        newParameter.name_ = newParameter.name_.slice(0, newParameter.name_.indexOf('?'));
                                        newParameter.optional = true;
                                    }

                                    newMethod.parameters[newParameter.name_ + '_'] = newParameter;
                                }
                            }

                            this.__handleTypeParams(parsedDocTags.typeparams, newMethod);

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

                            this.__handleTypeParams(parsedDocTags.typeparams, newClass);

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

                            this.__handleTypeParams(parsedDocTags.typeparams, newInterface);

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

            // start building the graph with namespaces
            for (var namespace in flat.namespaces) {
                var currentNamespace = flat.namespaces[namespace],
                    parent = null;

                if (currentNamespace.memberof) {
                    this.__findNode(currentNamespace, graph, (node) => {
                        parent = node;
                        currentNamespace.parent = parent;

                        if (!parent) {
                            return;
                        }

                        this.__appendChild(currentNamespace, parent);
                    });
                } else {
                    graph[currentNamespace.name_] = currentNamespace;
                }
            }
            //interfaces
            for (var interfaceNode in flat.interfaces) {
                var currentInterface = flat.interfaces[interfaceNode],
                    parent = null;

                this.__findNode(currentInterface, graph, (node) => {
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

                    this.__findNode(currentMethod, graph, (node) => {
                        parent = node;
                        currentMethod.parent = parent;

                        for (var j in currentMethod.parameters) {
                            var param: DocNodeTypes.IParameterNode = currentMethod.parameters[j],
                                resolvedType: DocNodeTypes.INode = null;
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
                        this.__appendChild(currentMethod, parent);
                    });
                }
            }

            //properties 
            for (var propertyNode in flat.properties) {
                var currentProperty = flat.properties[propertyNode],
                    parent = null;

                this.__findNode(currentProperty, graph, (node) => {
                    parent = node;
                    currentProperty.parent = parent;
                    this.__appendChild(currentProperty, parent);
                });
            }

            //events
            for (var eventNode in flat.events) {
                var currentEvent = flat.events[eventNode],
                    parent = null;

                this.__findNode(currentEvent, graph, (node) => {
                    parent = node;
                    currentEvent.parent = parent;
                    this.__appendChild(currentMethod, parent);
                });
            }

            callback(graph);
        };

        private __handleTypeParams = (typeparams: Array<ITag>, node: DocNodeTypes.INode) => {
            if (typeparams) {
                for (var t = 0; t < typeparams.length; t++) {
                    var currentTag: ITag = typeparams[t],
                        newTypeParameter: DocNodeTypes.ITypeParameterNode;

                    switch (node.kind) {
                        case 'interface': 
                            newTypeParameter.interface = node;
                            break;
                        case 'class':
                            newTypeParameter.class = node;
                            break;
                        case 'method':
                            newTypeParameter.method = node;
                            break;
                        default:
                            break;
                    }

                    newTypeParameter.name_ = currentTag.name;
                    newTypeParameter.typeString = currentTag.type;
                    newTypeParameter.description_ = currentTag.description;
                    newTypeParameter.porder = t;

                    node.typeparameters[newTypeParameter.name_ + '_'] = newTypeParameter;
                }
            }
        };

        private __appendChild = (childNode: DocNodeTypes.INode, parentNode: DocNodeTypes.INode): void => {
            var childContainer = this.__nodeContainer(childNode),
                parent = parentNode;

            var name = (childNode.kind === 'method') ? childNode.name_.toUpperCase() : childNode.name_;

            parent[name] = childNode;
        };

        /*
         * buildTags
         * Build an array of tags used to assemble the full graph of nodes.
         */
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
        returns?: ITag;
        optional?: ITag;
        params?: Array<any>;
        typeparams?: Array<ITag>;
        implements?: Array<any>;
        type?: ITag;
        readonly?: ITag;
        namespace?: ITag;
        extends?: Array<any>;
        class?: ITag;
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