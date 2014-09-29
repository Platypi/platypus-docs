/// <reference path="../../_references.ts" />

import utils = require('../../utils/utils');
import ds = require('../../variables/datastructures');

class ClassGraphHandler implements IGraphHandler {
    handleGraphNodes = (flatObj: IFlatObject): void => {
        utils.forEach(flatObj, (value, key, obj) => {
            var currentClass: IClassNode = flatObj[key];

            currentClass.namespace = ds.nameHashTable[currentClass.namespaceString];
            currentClass.extends = ds.nameHashTable[currentClass.parentString];

            var parentNode = currentClass.parent = currentClass.namespace;

            utils.forEach(currentClass.interfaces, (v, k, o) => {
                var currentSubInterface: IInterfaceNode = currentClass.interfaces[k];
                currentClass.interfaces[k] = ds.nameHashTable[currentSubInterface.name_] || currentClass.interfaces[k];
            });

            ds.appendChild(currentClass, parentNode);

        });
    };
}

export = ClassGraphHandler;