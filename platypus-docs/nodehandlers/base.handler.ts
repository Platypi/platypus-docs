/// <reference path="../_references.ts" />

import utils = require('../utils/utils');

class BaseHandler {
    static handleTypeParams = (typeparams: Array<ITag>, node: INode) => {
        if (!utils.isNull(typeparams)) {
            for (var t = 0; t < typeparams.length; t++) {
                var currentTag: ITag = typeparams[t],
                    newTypeParameter: ITypeParameterNode = {
                        name_: currentTag.name,
                        kind: 'typeparam',
                        typeString: currentTag.type,
                        description_: currentTag.description,
                        porder: t
                    };

                switch (node.kind) {
                    case 'interface':
                        newTypeParameter.interface = node;
                        break;
                    case 'class':
                        newTypeParameter.class = node;
                        break;
                    case 'method':
                        newTypeParameter.method = node;
                        break;
                    default:
                        break;
                }

                if (!node.typeparameters) {
                    node.typeparameters = {};
                }

                node.typeparameters[newTypeParameter.name_ + '_'] = newTypeParameter;
            }
        }
    };

    static stripTypeParam = (typeString: string): string => {
        if (typeString.indexOf('<') < 0) {
            return typeString;
        } else {
            return typeString.slice(0, typeString.indexOf('<'));
        }
    };
}

export = BaseHandler;