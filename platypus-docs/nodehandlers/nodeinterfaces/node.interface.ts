/// <reference path="../../_references.ts" />

interface INode {
    name_: string;
    description_?: string;
    kind: string;
    published?: boolean;
    exported?: boolean;
    memberof?: string;
    parent?: INode;
    visibility?: string;
    id?: number;
    saved?: boolean;
    typeparameters?: {};
    remarks?: string;
    version?: string;
}