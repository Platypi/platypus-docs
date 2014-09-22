﻿import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import types = require('../docnodes');
import tags = require('../tagbuilder');


class InterfaceHandler extends BaseHandler {
    static MakeNewInterfaceNode = (interfaceTag: tags.ParsedDocNode) => {
        var newInterface: types.IInterfaceNode = {
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

        //interfaces (extends) treat like params
        if (interfaceTag.extends) {
            for (var k in interfaceTag.extends) {
                var tag = interfaceTag.extends[k],
                    newExtends: types.IInterfaceNode = {
                        name_: BaseHandler.stripTypeParam(tag.type),
                        kind: 'interface'
                    };

                newInterface.interfaces[newExtends.name_] = newExtends;
            }
        }

        BaseHandler.handleTypeParams(interfaceTag.typeparams, newInterface);

        return newInterface;
    };
}

export = InterfaceHandler;