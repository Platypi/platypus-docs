﻿/// <reference path="../_references.ts" />

import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import ds = require('../variables/datastructures');

class ClassHandler extends BaseHandler {
    static MakeNewClassNode (tag: IParsedDocNode) {
        var memberof = (tag.memberof ? tag.memberof.name : '');

        var newClass: IClassNode = {
            name_: tag.name.name,
            description_: tag.description.description,
            kind: tag.kind.name,
            published: (!tag.published ? true : (tag.published.name !== 'false')),
            exported: (!tag.exported ? true : (tag.exported.name !== 'false')),
            visibility: (tag.access ? tag.access.name : 'public'),
            remarks: (tag.remarks ? tag.remarks.description : ''),
            parentString: (tag.extends && tag.extends[0] ? tag.extends[0].type : ''),
            namespaceString: memberof,
            interfaces: {},
            memberof: memberof,
            usage: (tag.usage ? tag.usage.name : null)
        };

        // interfaces (implements) treat like params
        if (tag.implements) {
            utils.forEach(tag.implements, (value, k, obj) => {
                var impTag = tag.implements[k],
                    type: string = impTag.type,
                    newInterface: IInterfaceNode = {
                        name_: BaseHandler.stripTypeParam(type),
                        kind: 'interface'
                    };

                newClass.interfaces[newInterface.name_] = newInterface;
            });
        }

        BaseHandler.handleTypeParams(tag.typeparams, newClass);

        return newClass;
    }

    static addToDataStructures(tag: IParsedDocNode): void {
        var newClass = ClassHandler.MakeNewClassNode(tag),
            className = ClassHandler.handleName(newClass);

        ds.flat.classes[className] = newClass;
        ds.nameHashTable[className] = ds.flat.classes[className];

    }
}

export = ClassHandler;