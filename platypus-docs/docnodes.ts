/*
 * docnodes
 * A collection of interfaces used throughout the application.
 */

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

interface IHaveExampleNode {
    example?: string;
    exampleurl?: string;
}

interface IHaveTypeNode {
    methodtype?: IMethodNode;
    classtype?: IClassNode;
    interfacetype?: IInterfaceNode;
}

interface IRegisteredNode {
    registeredtype?: string;
    registeredname?: string;
}

interface IHaveOverride {
    overrides?: boolean;
}

interface INameSpaceNode extends INode {
    classes?: {};
    namespaces?: {};
    interfaces?: {};
    methods?: {};
    properties?: {};
}

interface IEvent extends INode {
    class?: IClassNode;
    classNameString?: string;
    remarks?: string;
}

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

interface IInterfaceNode extends INode, IRegisteredNode {
    namespace?: INameSpaceNode;
    remarks?: string;
    exported?: boolean;
    methods?: {};
    interfaces?: {};
}

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

interface IParameterNode extends INode, IHaveTypeNode {
    method?: IMethodNode;
    type?: string;
    defaultvalue?: string;
    optional?: boolean;
    porder?: number;
}

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

interface ITypeParameterNode extends INode {
    typeString?: string;
    interface?: IInterfaceNode;
    class?: IClassNode;
    method?: IMethodNode;
    methodtype?: IMethodNode;
    classtype?: IClassNode;
    interfacetype?: IInterfaceNode
    porder?: number;
}