/// <reference path="docnodes.ts" />
/// <reference path="typings/tsd.d.ts" />

import DocNodeTypes = require('./docnodes');
var parser = require('comment-parser');

export module DocGen {
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


            for (var k in tags) {
                var tmpObj: any = {};

                for (var l in tags[k].tags) {
                    var t = tags[k].tags[l];
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
                            if (tmpObj.name) {
                                //var member = tree[memberof];
                                var newMethod: DocNodeTypes.IMethodNode = {
                                    name: tmpObj.name.name,
                                    description: tmpObj.description.descrption,
                                    kind: tmpObj.kind.name,
                                    overrides: (tmpObj.variation ? true : false),
                                    visibility: tmpObj.access.name,
                                    static: (tmpObj.static ? true : false),
                                    remarks: tmpObj.remarks,
                                    exported: (!tmpObj.exported ? true : false),
                                    typeparamaters: (tmpObj.typeparam ? tmpObj.typeparam.name : ''),
                                    returnType: (tmpObj.returns ? tmpObj.returns.name : ''),
                                    returntypedesc: (tmpObj.returns ? tmpObj.returns.description : ''),
                                    optional: (tmpObj.optional ? true : false),
                                    parameters: [],
                                    published: true
                                };

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

                                (<any>flat.methods).push(newMethod);

                            }
                            break;
                        case 'property':
                            break;
                        case 'class':
                            break;
                        case 'interface':
                            break;
                        case 'event':
                            break;
                        case 'namespace':
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