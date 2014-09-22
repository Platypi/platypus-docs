export var buildTags = (tag: any): ParsedDocNode => {
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
    implements?: Array<ITag>;
    type?: ITag;
    readonly?: ITag;
    namespace?: ITag;
    extends?: Array<any>;
    class?: ITag;
}

export interface ITag {
    tag: string;
    name: string;
    type: string;
    description: string;
}