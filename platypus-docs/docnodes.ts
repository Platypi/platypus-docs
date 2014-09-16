export interface INode {
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
    typeparams?: {};
    remarks?: string;
    version?: string;
}

export interface IHaveExampleNode {
    example?: string;
    exampleurl?: string;
}

export interface IHaveTypeNode {
    methodtype?: IMethodNode;
    classtype?: IClassNode;
    interfacetype?: IInterfaceNode;
}

export interface IRegisteredNode {
    registeredtype?: string;
    registeredname?: string;
}

export interface IHaveOverride {
    overrides?: boolean;
}

export interface INameSpaceNode extends INode {
    classes?: {};
    namespaces?: {};
    interfaces?: {};
    methods?: {};
    properties?: {};
}

export interface IEvent extends INode {
    class?: IClassNode;
    classNameString?: string;
    remarks?: string;
}

export interface IClassNode extends INode, IHaveExampleNode, IRegisteredNode {
    parentString?: string;
    namespace?: INameSpaceNode;
    namespaceString?: string;
    extends?: IClassNode;
    exported?: boolean;
    remarks?: string;
    methods?: {};
    static?: boolean;
    interfaces?: {};
}

export interface IInterfaceNode extends INode, IRegisteredNode {
    namespace?: INameSpaceNode;
    remarks?: string;
    exported?: boolean;
    methods?: {};
    interfaces?: {};
}

export interface IMethodNode extends INode, IHaveExampleNode, IHaveOverride {
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

export interface IParameterNode extends INode, IHaveTypeNode {
    method?: IMethodNode;
    type?: string;
    defaultvalue?: string;
    optional?: boolean;
    porder?: string;
}

export interface IPropertyNode extends INode, IHaveTypeNode, IHaveOverride {
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

export interface ITypeParameterNode extends INode {
    interface?: IInterfaceNode;
    class?: IClassNode;
    method?: IMethodNode;
    methodtype?: IMethodNode;
    classtype?: IClassNode;
    interfacetype?: IInterfaceNode
    porder?: string;
}