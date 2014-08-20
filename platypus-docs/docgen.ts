/// <reference path="typings/tsd.d.ts" />
var parser = require('comment-parser'),
    nodes = require('./docnodes');

export module DocGen {
    export class DocGenerator {
        fromFile = (filename: string) => {
            parser.file(filename, (err: any, data: any) => {
                if (!err) {
                    console.log('building tree from ' + filename);
                    this.__buildTree(data);
                } else {
                    console.log(new Error(err));
                }
            });
        };

        private __buildTree = (data: Array<any>) => {
            var tags: Array<ITag> = [];

            for (var i = 0; i < data.length; i++) {
                for (var j = 0; j < data[i].tags.length; j++) {
                    var currentTag: ITag = (<any>data[i]).tags[j];
                    tags.push(currentTag);
                }
            }

            console.log(JSON.stringify(tags));
        };
    }

    export interface ITag {
        tag: string;
        name: string;
        type: string;
        description: string;
    }
}