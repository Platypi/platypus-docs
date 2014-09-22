﻿import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import types = require('../docnodes');
import tags = require('../tagbuilder');

class NamespaceHandler extends BaseHandler {
    static MakeNewNamespaceNode = (tag: tags.ParsedDocNode) => {
        var newNamespace: types.INameSpaceNode = {
            name_: tag.name.name,
            kind: tag.kind.name,
            description_: tag.description.description,
            visibility: (tag.access ? tag.access.name : 'public'),
            published: (!tag.published ? true : (tag.published.name !== 'false')),
            exported: (!tag.exported ? true : (tag.exported.name !== 'false')),
            remarks: (tag.remarks ? tag.remarks.description : ''),
            memberof: (tag.memberof ? tag.memberof.name : '')
        };

        return newNamespace;
    };
}

export = NamespaceHandler;