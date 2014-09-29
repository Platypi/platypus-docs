/// <reference path="../../_references.ts" />

interface IMethodNode extends INode, IHaveExampleNode, IHaveOverride {
    interfaceNode?: IInterfaceNode;
    namespaceNode?: INameSpaceNode;
    classNode?: IClassNode;
    remarks?: string;
    static?: boolean;
    returntype?: string;
    returntypedesc?: string;
    returntypemethod?: IMethodNode;
    returntypeinterface?: IInterfaceNode;
    returntypeclass?: IClassNode;
    returntypenamespace?: INameSpaceNode;
    optional?: boolean;
    parameters?: {};
}
