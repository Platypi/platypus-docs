/// <reference path="../../_references.ts" />

interface IClassNode extends INode, IHaveExampleNode, IRegisteredNode {
    parentString?: string;
    namespace?: INameSpaceNode;
    namespaceString?: string;
    extends?: IClassNode;
    exported?: boolean;
    remarks?: string;
    methods?: {};
    static?: boolean;
    interfaces?: {};
    usage?: string;
}
