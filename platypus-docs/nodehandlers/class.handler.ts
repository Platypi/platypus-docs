import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import types = require('../docnodes');
import tags = require('../tags/tagbuilder');

class ClassHandler extends BaseHandler {
    static MakeNewClassNode = (tag: tags.ParsedDocNode) => {
        var memberof = (tag.memberof ? tag.memberof.name : '');

        var newClass: types.IClassNode = {
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
            memberof: memberof
        };

        //interfaces (implements) treat like params
        if (tag.implements) {
            for (var k in tag.implements) {
                var impTag = tag.implements[k],
                    type: string = impTag.type,
                    newInterface: types.IInterfaceNode = {
                        name_: BaseHandler.stripTypeParam(type),
                        kind: 'interface'
                    };

                newClass.interfaces[newInterface.name_] = newInterface;
            }
        }

        BaseHandler.handleTypeParams(tag.typeparams, newClass);

        return newClass;
    };
}

export = ClassHandler;