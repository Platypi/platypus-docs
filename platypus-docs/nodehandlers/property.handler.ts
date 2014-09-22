﻿import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import types = require('../docnodes');
import tags = require('../tagbuilder');

class PropertyHandler extends BaseHandler {
    static MakeNewPropertyNode = (tag: tags.ParsedDocNode): types.IPropertyNode => {
        var newProperty: types.IPropertyNode = {
            name_: tag.name.name,
            description_: tag.description.description,
            kind: tag.kind.name,
            published: (!tag.published ? true : (tag.published.name !== 'false')),
            exported: (!tag.exported ? true : (tag.exported.name !== 'false')),
            visibility: (tag.access ? tag.access.name : 'public'),
            type: tag.type.type,
            remarks: (tag.remarks ? tag.remarks.description : ''),
            static: (tag.static ? true : false),
            readonly: (tag.readonly ? true : false),
            optional: (tag.optional ? true : false),
            memberof: (tag.memberof ? tag.memberof.name : '')
        };

        return newProperty;
    };
}

export = PropertyHandler;