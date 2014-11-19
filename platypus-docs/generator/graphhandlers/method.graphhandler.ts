/// <reference path="../../_references.ts" />

import utils = require('../../utils/utils');
import ds = require('../../variables/datastructures');

class MethodGraphNodeHandler implements IGraphHandler {

    constructor(private flatObj: { [name: string]: Array<IMethodNode> }) { }

    handleGraphNodes(): void {
        utils.forEach(this.flatObj, (value, key, obj) => {
            var methodArray = Object.keys(this.flatObj[key]);
            utils.forEach(methodArray, (v, k, o) => {
                var currentMethod = ds.flat.methods[key][k],
                    returnTypeName = (typeof currentMethod.returntype === 'string' ? currentMethod.returntype : '');
                
                var returnTypeNode = ds.nameHashTable[returnTypeName];

                if (returnTypeNode) {
                    if (returnTypeNode === 'namespace') {
                        currentMethod.returntypenamespace = returnTypeNode;
                    } else if (returnTypeNode === 'class') {
                        currentMethod.returntypeclass = returnTypeNode;
                    } else if (returnTypeNode === 'interface') {
                        currentMethod.returntypeinterface = returnTypeNode;
                    }
                }

                ds.findNode(currentMethod, (node) => {
                    var parentNode = node;
                    currentMethod.parent_ = parentNode;

                    utils.forEach(currentMethod.parameters, (v, k, o) => {
                        var param: IParameterNode = currentMethod.parameters[k],
                            resolvedType: INode = null;

                        if (param.type) {
                            resolvedType = ds.nameHashTable[param.type];
                        }

                        if (resolvedType) {
                            var rKind = resolvedType.kind;

                            if (rKind === 'method') {
                                param.methodtype = resolvedType;
                            } else if (rKind === 'class') {
                                param.classtype = resolvedType;
                            } else if (rKind === 'interface') {
                                param.interfacetype = resolvedType;
                            }

                        }
                        param.method = currentMethod;
                        currentMethod.parameters[k] = param;
                    });

                    ds.appendChild(currentMethod, parentNode);
                });
            });
        });
    }
}

export = MethodGraphNodeHandler;