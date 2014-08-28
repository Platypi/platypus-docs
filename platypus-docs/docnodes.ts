export interface INode {
    name: string;
    description?: string;
    kind: string;
    published?: boolean;
    exported?: boolean;
    memberof?: string;
    parent?: INode;
    visibility?: string;
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
    //classes?: Array<IClassNode>;
    classes?: {};
    namespaces?: {};
    interfaces?: {};
    methods?: {};
    properties?: {};
    //namespaces?: Array<INameSpaceNode>;
    //interfaces?: Array<IInterfaceNode>;
    //methods?: Array<IMethodNode>;
    //properties?: Array<IPropertyNode>;
}

export interface IEvent extends INode {
    class?: IClassNode;
    classNameString?: string;
    remarks?: string;
}

export interface IClassNode extends INode, IHaveExampleNode, IRegisteredNode {
    parent?: IClassNode;
    parentString?: string;
    namespace?: INameSpaceNode;
    namespaceString?: string;
    exported?: boolean;
    remarks?: string;
    //methods?: Array<IMethodNode>;
    methods?: {};
    static?: boolean;
    //interfaces?: Array<IInterfaceNode>;
    interfaces?: {};
}

export interface IInterfaceNode extends INode, IRegisteredNode {
    namespace?: INameSpaceNode;
    remarks?: string;
    exported?: boolean;
    //methods?: Array<IMethodNode>;
    methods?: {};
}

export interface IMethodNode extends INode, IHaveExampleNode, IHaveOverride {
    interfaceNode?: IInterfaceNode;
    namespaceNode?: INameSpaceNode;
    classNode?: IClassNode;
    remarks?: string;
    static?: boolean;
    //typeparamaters?: Array<IParameterNode>;
    typeparameters?: {};
    returntype?: string;
    returntypedesc?: string;
    returntypemethod?: IMethodNode;
    returntypeinterface?: IInterfaceNode;
    returnttypeclass?: IClassNode;
    returntypenamespace?: INameSpaceNode;
    optional?: boolean;
    //parameters?: Array<IParameterNode>;
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
