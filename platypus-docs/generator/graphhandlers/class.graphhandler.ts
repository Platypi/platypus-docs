/// <reference path="../../_references.ts" />

import utils = require('../../utils/utils');
import ds = require('../../variables/datastructures');

class ClassGraphHandler implements IGraphHandler {

    constructor(private flatObj: IFlatObject) { }

    handleGraphNodes(): void {
        utils.forEach(this.flatObj, (value, key, obj) => {
            var currentClass: IClassNode = this.flatObj[key];

            currentClass.namespace = ds.nameHashTable[currentClass.namespaceString];
            currentClass.extends = ds.nameHashTable[currentClass.parentString];

            var parentNode = currentClass.parent_ = currentClass.namespace;

            utils.forEach(currentClass.interfaces, (v, k, o) => {
                var currentSubInterface: IInterfaceNode = currentClass.interfaces[k];
                currentClass.interfaces[k] = ds.nameHashTable[currentSubInterface.name_] || currentClass.interfaces[k];
            });

            ds.appendChild(currentClass, parentNode);

        });
    }
}

export = ClassGraphHandler;