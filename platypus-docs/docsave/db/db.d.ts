declare module db {
    export module docs {
        export module api {
            export interface IBaseRow {
                name?: string;
                doctype?: string;
                description?: string;
                id?: number;
            }

            export interface INamespaceRow extends IBaseRow {
                inherits?: Array<INamespaceRow>;
                namespaces?: Array<INamespaceRow>;
                classes?: Array<IClassRow>;
                interfaces?: Array<IInterfaceRow>;
                methods?: Array<INamespaceChildRow>;
                properties?: Array<INamespaceChildRow>;
                parentid?: number;
                parent?: INamespaceRow;
            }

            export interface INamespaceChildRow extends IBaseRow {
                namespaceid?: number;
                namespace?: INamespaceRow;
            }

            export interface IClassRow extends INamespaceChildRow {
                inherits?: Array<IClassRow>;
                children?: Array<IClassRow>;
                interfaces?: Array<IInterfaceRow>;
                methods?: Array<IClassChildRow>;
                properties?: Array<IClassChildRow>;
                typeparameters?: Array<ITypeParameterRow>;
                events?: Array<IEventRow>;
            }

            export interface IMethodRow extends IClassRow {
                parent?: IBaseRow;
                parameters?: Array<IParametersRow>;
                typeparameters?: Array<ITypeParameterRow>;
            }

            export interface IParametersRow extends IBaseRow {

            }

            export interface IMethodsRow extends IBaseRow {
                parameters?: Array<IParametersRow>;
                typeparameters?: Array<ITypeParameterRow>;
            }

            export interface ITypeParameterRow extends IBaseRow {

            }

            export interface IPropertyRow extends IBaseRow {

            }

            export interface IEventRow extends IBaseRow {

            }

            export interface IClassChildRow extends IBaseRow {
                classid?: number;
                class?: IClassRow;
            }

            export interface IInterfaceRow extends INamespaceChildRow {
                inherits?: Array<IInterfaceRow>;
                methods?: Array<IInterfaceChildRow>;
                properties?: Array<IInterfaceChildRow>;
                typeparameters?: Array<ITypeParameterRow>;
            }

            export interface IInterfaceChildRow extends IBaseRow {
                interfaceid?: number;
                interface?: IInterfaceRow;
            }

            export module rowsets {
                export interface IDocTreeRowSets extends Array<IBaseRow> {
                    0: Array<INamespaceRow>;
                    1: Array<INamespaceChildRow>;
                    2: Array<INamespaceChildRow>;
                    3: Array<IClassRow>;
                    4: Array<IClassChildRow>;
                    5: Array<IClassChildRow>;
                    6: Array<IInterfaceRow>;
                    7: Array<IInterfaceChildRow>;
                    8: Array<IInterfaceChildRow>;
                }

                export interface IGetClassRowSets extends Array<IBaseRow> {
                    0: Array<IClassRow>;
                    1: Array<INamespaceRow>;
                    2: Array<IClassRow>;
                    3: Array<IInterfaceRow>;
                    4: Array<IMethodsRow>;
                    5: Array<IParametersRow>;
                    6: Array<ITypeParameterRow>;
                    7: Array<IClassChildRow>;
                    8: Array<ITypeParameterRow>;
                    9: Array<IEventRow>;
                }

                export interface IGetInterfaceRowSets extends Array<IBaseRow> {
                    0: Array<IInterfaceRow>;
                    1: Array<IInterfaceChildRow>;
                    2: Array<INamespaceRow>;
                    3: Array<IMethodsRow>;
                    4: Array<IPropertyRow>;
                    5: Array<ITypeParameterRow>;
                }

                export interface IGetMethodRowSets extends Array<IBaseRow> {
                    0: Array<IMethodRow>;
                    1: Array<IBaseRow>;
                    2: Array<IParametersRow>;
                    3: Array<ITypeParameterRow>;
                }

                export interface IGetNamespaceRowSets extends Array<IBaseRow> {
                    0: Array<INamespaceRow>;
                    1: Array<INamespaceRow>;
                    2: Array<IClassRow>;
                    3: Array<IInterfaceRow>;
                    4: Array<INamespaceChildRow>;
                    5: Array<INamespaceChildRow>;
                }

                export interface IGetParameterRowSets extends Array<IBaseRow> {
                    0: Array<IParametersRow>;
                }
            }
        }
    }
} 