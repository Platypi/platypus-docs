/// <reference path="../../_references.ts" />

interface IGraphHandler {
    handleGraphNodes: () => void;
}

interface IFlatObject {
    [name: string]: INode;
}