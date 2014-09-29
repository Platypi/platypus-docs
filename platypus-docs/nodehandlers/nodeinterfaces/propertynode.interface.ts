/// <reference path="../../_references.ts" />

interface IPropertyNode extends INode, IHaveTypeNode, IHaveOverride {
    interface?: IInterfaceNode;
    namespace?: INameSpaceNode;
    class?: IClassNode;
    type?: string;
    remarks?: string;
    static?: boolean;
    readonly?: boolean;
    returntypedesc?: string;
    optional?: boolean;
}
