/// <reference path="../_references.ts" />

import utils = require('../utils/utils');

export var buildTags = (tag: any): IParsedDocNode => {
    var tmpObj: any = {};

    utils.forEach(tag.tags, (v, l, o) => {
        var t = tag.tags[l];

        // there can be multiple params/implements/extends/typeparams for a given comment.
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
    });

    return tmpObj;
};
