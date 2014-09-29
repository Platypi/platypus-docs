/// <reference path="../../_references.ts" />


interface IGraphHandler {
    handleGraphNodes: (flatObj: IFlatObject) => void;
}

interface IFlatObject {
    [name: string]: INode;
}