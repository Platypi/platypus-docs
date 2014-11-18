/// <reference path="../../_references.ts" />

import utils = require('../../utils/utils');
import ds = require('../../variables/datastructures');
import globals = require('../../variables/globals');

class GraphNodeHandler implements IGraphHandler {

    constructor(private flatObj: IFlatObject) { }

    handleGraphNodes(): void {
        utils.forEach(this.flatObj, (value, key, obj) => {
            var currentNode: INode = this.flatObj[key];

            if (currentNode.memberof) {
                ds.findNode(currentNode, (node: INode) => {
                    currentNode.parent_ = node;

                    if (!node) {
                        return;
                    }

                    ds.appendChild(currentNode, node);
                });
            } else {
                ds.graph[currentNode.name_] = currentNode;
                globals.nodeCount++;
            }
        });
    }
}

export = GraphNodeHandler;