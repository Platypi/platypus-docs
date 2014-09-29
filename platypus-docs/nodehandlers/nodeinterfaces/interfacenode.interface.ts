/// <reference path="../../_references.ts" />

interface IInterfaceNode extends INode, IRegisteredNode {
    namespace?: INameSpaceNode;
    remarks?: string;
    exported?: boolean;
    methods?: {};
    interfaces?: {};
}
