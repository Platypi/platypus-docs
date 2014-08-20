module DocNodes {
    export interface INameSpaceNode {
        name: string;
        parent?: INameSpaceNode;
        namespaces?: Array<INameSpaceNode>;
        classes?: Array<IClassNode>;
        interfaces?: Array<IInterfaceNode>;
        methods?: Array<IMethod>;
    }

    export interface IClassNode {
        name: string;
        parent?: IClassNode;
        namespace?: INameSpaceNode;
        interfaces?: Array<IInterfaceNode>;
        methods?: Array<IMethod>;
    } 

    export interface IInterfaceNode {
        name: string;
        parent?: IInterfaceNode;
        namespace?: INameSpaceNode;
        interfaces?: Array<IInterfaceNode>;
        methods?: Array<IMethod>;
    }

    export interface IMethod {
        name: string;
    }
}