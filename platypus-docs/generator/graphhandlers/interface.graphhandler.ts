/// <reference path="../../_references.ts" />

import utils = require('../../utils/utils');
import ds = require('../../variables/datastructures');

class InterfaceGraphHandler implements IGraphHandler {
    handleGraphNodes = (flatObj: IFlatObject): void => {
        utils.forEach(flatObj, (value, key, obj) => {
            var currentInterface: IInterfaceNode = flatObj[key];

            if (currentInterface.memberof) {
                ds.findNode(currentInterface, (node: INode) => {
                    currentInterface.parent = node;

                    if (!node) {
                        return;
                    }

                    utils.forEach(currentInterface.interfaces, (v, k, o) => {
                        var subinterface: IInterfaceNode = currentInterface.interfaces[k];
                        currentInterface.interfaces[k] = ds.nameHashTable[subinterface.name_] || subinterface;
                    });

                    ds.appendChild(currentInterface, node);
                });
            } else {
                ds.graph[currentInterface.name_] = currentInterface;
            }
        });
    };
}

export = InterfaceGraphHandler;