/// <reference path="../_references.ts" />

import BaseHandler = require('./base.handler');
import ds = require('../variables/datastructures');

class NamespaceHandler extends BaseHandler {
    static MakeNewNamespaceNode (tag: IParsedDocNode) {
        var newNamespace: INameSpaceNode = {
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
    }

    static handleName(newNamespace: INameSpaceNode): string {
        var namespaceName = newNamespace.name_;

        if (!!newNamespace.memberof) {
            namespaceName = newNamespace.memberof + '.' + newNamespace.name_;
        }

        return namespaceName;
    }

    static addToDataStructures(tag: IParsedDocNode): void {
        var newNamespace = NamespaceHandler.MakeNewNamespaceNode(tag),
            namespaceName = NamespaceHandler.handleName(newNamespace);

        ds.flat.namespaces[namespaceName] = newNamespace;
        ds.nameHashTable[namespaceName] = ds.flat.namespaces[namespaceName];

    }
}

export = NamespaceHandler;