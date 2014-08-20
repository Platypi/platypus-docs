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
                        console.log(JSON.stringify(tags));
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

        private __treeGen = (tags: Array<Array<ITag>>, callback: (tree: any) => void) => {
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

            for (var i = 0; i < tags.length; i++) {
                var tmpObj:any = {};
                for (var j = 0; j < tags[i].length; j++) {
                    var t = tags[i][j];
                    tmpObj[t.tag] = t;
                }

                if (tmpObj.kind) {

                    var kind: string = (<string>tmpObj.kind.name).trim().toLowerCase(),
                        memberof: string = (<string>tmpObj.memberof.name).trim().toLowerCase();

                    switch (kind) {
                        case 'function': 
                            var member = tree[memberof];
                            var newMethod: DocNodeTypes.IMethodNode = {
                                name: tmpObj.name.name,
                                description: tmpObj.description.descrption,
                                kind: tmpObj.kind.name,
                                published: true
                            };

                            switch (member.kind) {
                                case 'class':
                                    break;
                                case 'interface':
                                    break;
                                case 'namespace':
                                    newMethod.namespaceNode = member;
                                    member.methods.push(newMethod);
                                    break;
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
        };
    }

    export interface ITag {
        tag: string;
        name: string;
        type: string;
        description: string;
    }
}