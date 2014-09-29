/// <reference path="../../_references.ts" />


interface IGraphHandler {
    new(flatObj: IFlatObject): IGraphHandler;
    handleGraphNodes: () => void;
}

interface IFlatObject {
    [name: string]: INode;
}