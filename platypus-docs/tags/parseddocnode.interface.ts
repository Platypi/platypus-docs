/// <reference path="../_references.ts" />

interface IParsedDocNode {
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
    usage: ITag;
} 