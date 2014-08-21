export interface INode {
    name: string;
    description?: string;
    kind: string;
    published?: boolean;
    exported?: boolean;
    memberof?: string;
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
    parent?: INameSpaceNode;
    classes?: Array<IClassNode>;
    namespaces?: Array<INameSpaceNode>;
    interfaces?: Array<IInterfaceNode>;
    methods?: Array<IMethodNode>;
    properties?: Array<IPropertyNode>;
}

export interface IEvent extends INode {
    class?: IClassNode;
    remarks?: string;
}

export interface IClassNode extends INode, IHaveExampleNode, IRegisteredNode {
    parent?: IClassNode;
    namespace?: INameSpaceNode;
    exported?: boolean;
    remarks?: string;
    methods?: Array<IMethodNode>;
    static?: boolean;
    interfaces?: Array<IInterfaceNode>;
}

export interface IInterfaceNode extends INode, IRegisteredNode {
    namespace?: INameSpaceNode;
    remarks?: string;
    exported?: boolean;
    methods?: Array<IMethodNode>;
}

export interface IMethodNode extends INode, IHaveExampleNode, IHaveOverride {
    interfaceNode?: IInterfaceNode;
    namespaceNode?: INameSpaceNode;
    classNode?: IClassNode;
    remarks?: string;
    visibility?: string;
    static?: boolean;
    typeparamaters?: Array<IParameterNode>;
    returntype?: string;
    returntypedesc?: string;
    returntypemethod?: IMethodNode;
    returntypeinterface?: IInterfaceNode;
    returnttypeclass?: IClassNode;
    returntypenamespace?: INameSpaceNode;
    optional?: boolean;
    parameters?: Array<IParameterNode>;
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
    visibility?: string;
    static?: boolean;
    readonly?: boolean;
    returntypedesc?: string;
    optional?: boolean;
}
