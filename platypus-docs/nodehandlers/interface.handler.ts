/// <reference path="../_references.ts" />

import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import ds = require('../variables/datastructures');


class InterfaceHandler extends BaseHandler {
    static MakeNewInterfaceNode (interfaceTag: IParsedDocNode) {
        var newInterface: IInterfaceNode = {
            name_: interfaceTag.name.name,
            kind: interfaceTag.kind.name,
            description_: interfaceTag.description.description,
            visibility: (interfaceTag.access ? interfaceTag.access.name : 'public'),
            published: (!interfaceTag.published ? true : (interfaceTag.published.name !== 'false')),
            exported: (!interfaceTag.exported ? true : (interfaceTag.exported.name !== 'false')),
            remarks: (interfaceTag.remarks ? interfaceTag.remarks.description : ''),
            memberof: (interfaceTag.memberof ? interfaceTag.memberof.name : ''),
            interfaces: {}
        };

        // interfaces (extends) treat like params
        if (interfaceTag.extends) {
            utils.forEach(interfaceTag.extends, (value, k, obj) => {
                var tag = interfaceTag.extends[k],
                    newExtends: IInterfaceNode = {
                        name_: BaseHandler.stripTypeParam(tag.type),
                        kind: 'interface'
                    };

                newInterface.interfaces[newExtends.name_] = newExtends;
            });
        }

        BaseHandler.handleTypeParams(interfaceTag.typeparams, newInterface);

        return newInterface;
    }

    static addToDataStructures(tag: IParsedDocNode): void {
        var newInterface = InterfaceHandler.MakeNewInterfaceNode(tag),
            interfaceName = InterfaceHandler.handleName(newInterface);

        ds.flat.interfaces[interfaceName] = newInterface;
        ds.nameHashTable[interfaceName] = ds.flat.interfaces[interfaceName];
    }
}

export = InterfaceHandler;