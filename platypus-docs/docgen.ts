/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

import DocNodeTypes = require('./docnodes');
var parser = require('comment-parser');

export module DocGen {
    
    /**
     * Generate Docs from source file.
     */
    export class DocGenerator {
        fromFile = (filename: string) => {
            parser.file(filename, (err: any, data: any) => {
                if (!err) {
                    this.__grabTags(data, (tags: Array<Array<ITag>>) => {
                        this.__treeGen(data, (tree: any) => {
                            console.log(JSON.stringify(tree));
                        });
                    });
                } else {
                    console.log(new Error(err));
                }
            });
        };

        /**
         * Populate the tags from comments into an array.
         */
        private __grabTags = (data: Array<any>, callback: (tags: Array<Array<ITag>>) => void) => {
            var tags: Array<Array<ITag>> = [],
                unmatchedTags = [];

            for (var i = 0; i < data.length; i++) {
                if (!tags[i]) {
                    tags[i] = new Array<ITag>();
                }

                for (var j = 0; j < data[i].tags.length; j++) {
                    var currentTag: ITag = (<any>data[i]).tags[j];
                    tags[i].push(currentTag);
                }
            }
            callback(tags);
        };

        /**
         * Generate a tree structure of tags as they appear in code.
         */
        private __treeGen = (tags: any, callback: (tree: any) => void) => {
            var tree: {
                [index: string]: DocNodeTypes.INameSpaceNode
            } = {};

            tree['plat'] = {
                name: 'plat',
                kind: 'namespace',
                namespaces: [],
                interfaces: [],
                classes: [],
                methods: [],
                properties: []
            };

            /*
             * First run through will generate a flat 
             * data structure as we may not yet have all the tags
             * need to reference each other in memory.
             */
            var flat: {
                namespaces: Array<DocNodeTypes.INameSpaceNode>;
                interfaces: Array<DocNodeTypes.IInterfaceNode>;
                classes: Array<DocNodeTypes.IClassNode>;
                methods: Array<DocNodeTypes.IMethodNode>;
                properties: Array<DocNodeTypes.IPropertyNode>;
                events: Array<DocNodeTypes.IEvent>;
            } = {
                namespaces: [],
                interfaces: [],
                classes: [],
                methods: [],
                properties: [],
                events: []
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
                                visibility: tmpObj.access.name,
                                static: (tmpObj.static ? true : false),
                                remarks: tmpObj.remarks,
                                exported: (!tmpObj.exported ? true : false),
                                typeparamaters: (tmpObj.typeparam ? tmpObj.typeparam.name : ''),
                                returntype: (tmpObj.returns ? tmpObj.returns.type : ''),
                                returntypedesc: (tmpObj.returns ? tmpObj.returns.name + tmpObj.returns.description : ''),
                                optional: (tmpObj.optional ? true : false),
                                parameters: [],
                                published: true
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
                                    newMethod.parameters.push(newParameter);
                                }
                            }

                            flat.methods.push(newMethod);
                            break;
                        case 'property':
                            if (!tmpObj.description) {
                                console.log(tmpObj);
                            }
                            var newProperty: DocNodeTypes.IPropertyNode = {
                                name: tmpObj.name.name,
                                description: tmpObj.description.description,
                                kind: tmpObj.kind.name,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                //interface
                                //namespace
                                //class
                                type: tmpObj.type.type,
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                visibility: tmpObj.access.name,
                                static: (tmpObj.static ? true : false),
                                readonly: (tmpObj.readonly ? true : false),
                                optional: (tmpObj.optional ? true : false)
                            };

                            flat.properties.push(newProperty);
                            break;
                        case 'class':
                            var newClass: DocNodeTypes.IClassNode = {
                                name: tmpObj.name.name,
                                description: tmpObj.description.description,
                                kind: tmpObj.kind.name,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                //parent (extends)
                                parent: (tmpObj['extends'] ? tmpObj['extends'].type : ''),
                                //namespace (memberof)
                                namespace: (tmpObj.namespace ? tmpObj.namespace.type : '')
                            };

                            //interfaces (implements) treat like params
                            flat.classes.push(newClass);
                            break;
                        case 'interface':
                            var newInterface: DocNodeTypes.IInterfaceNode = {
                                name: tmpObj.name.name,
                                kind: tmpObj.kind.name,
                                description: tmpObj.description.description,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                //methods
                            };
                            flat.interfaces.push(newInterface);
                            break;
                        case 'event':
                            var newEvent: DocNodeTypes.IEvent = {
                                name: tmpObj.name.name,
                                kind: tmpObj.kind.name,
                                description: tmpObj.description.description,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                                //class @class
                                class: tmpObj.class.name
                            };

                            flat.events.push(newEvent);
                            break;
                        case 'namespace':
                            var newNamespace: DocNodeTypes.INameSpaceNode = {
                                name: tmpObj.name.name,
                                kind: tmpObj.kind.name,
                                description: tmpObj.description.description,
                                published: (!tmpObj.published ? true : tmpObj.published),
                                exported: (!tmpObj.exported ? true : tmpObj.exported),
                                remarks: (tmpObj.remarks ? tmpObj.remarks.description : ''),
                            };

                            flat.namespaces.push(newNamespace);
                            break;
                    }
                }
            }

            callback(flat);
        };
    }

    export interface ITag {
        tag: string;
        name: string;
        type: string;
        description: string;
    }
}

// for future function to determine what kind to push new node to
//switch (member.kind) {
//    case 'class':
//        break;
//    case 'interface':
//        break;
//    case 'namespace':
//        newMethod.namespaceNode = member;
//        member.methods.push(newMethod);
//        break;
//}