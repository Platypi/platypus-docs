/// <reference path="../../_references.ts" />

interface IParameterNode extends INode, IHaveTypeNode {
    method?: IMethodNode;
    type?: string;
    defaultvalue?: string;
    optional?: boolean;
    porder?: number;
}
 