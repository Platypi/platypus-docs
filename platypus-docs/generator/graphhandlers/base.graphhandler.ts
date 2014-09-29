/// <reference path="../../_references.ts" />

import utils = require('../../utils/utils');
import ds = require('../../variables/datastructures');

class GraphNodeHandler implements IGraphHandler {
    handleGraphNodes = (flatObj: IFlatObject): void => {
        utils.forEach(flatObj, (value, key, obj) => {
            var currentNode: INode = flatObj[key];

            if (currentNode.memberof) {
                ds.findNode(currentNode, (node: INode) => {
                    currentNode.parent = node;

                    if (!node) {
                        return;
                    }

                    ds.appendChild(currentNode, node);
                });
            } else {
                ds.graph[currentNode.name_] = currentNode;
            }
        });
    };
}

export = GraphNodeHandler;