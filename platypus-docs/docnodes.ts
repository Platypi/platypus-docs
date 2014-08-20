export module DocNodes {
    export interface INode {
        name: string;
        parent?: INameSpaceNode;
        namespaces?: Array<INameSpaceNode>;
    }
    
    export interface INameSpaceNode extends INode {
        classes?: Array<IClassNode>;
        interfaces?: Array<IInterfaceNode>;
        methods?: Array<IMethod>;
    }

    export interface IClassNode extends INode {
        interfaces?: Array<IInterfaceNode>;
        methods?: Array<IMethod>;
    } 

    export interface IInterfaceNode extends INode {
        interfaces?: Array<IInterfaceNode>;
        methods?: Array<IMethod>;
    }

    export interface IMethod extends INode {
        parameters: Array<IClassNode>;
        return: IClassNode;
    }
}