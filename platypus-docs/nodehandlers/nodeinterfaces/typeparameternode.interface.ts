/// <reference path="../../_references.ts" />

interface ITypeParameterNode extends INode {
    typeString?: string;
    interface?: IInterfaceNode;
    class?: IClassNode;
    method?: IMethodNode;
    methodtype?: IMethodNode;
    classtype?: IClassNode;
    interfacetype?: IInterfaceNode;
    porder?: number;
}
