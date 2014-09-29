/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class NamespaceProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Namespace');
    }

    getArgs(namespace: INameSpaceNode): Array<any> {
        if (!utils.isObject(namespace)) {
            return [];
        }

        return [
            (namespace.parent ? namespace.parent.id : null),
            namespace.name_,
            namespace.description_,
            false,
            namespace.version
        ];
    }

    read(id: number, overloads: boolean) {
        return super.read(id, !overloads).then((sets: db.docs.api.rowsets.IGetNamespaceRowSets) => {
            var inherits = sets[0],
                namespaces = sets[1],
                classes = sets[2],
                interfaces = sets[3],
                methods = sets[4],
                properties = sets[5],
                namespace = inherits.pop();

            namespace.inherits = inherits;
            namespace.namespaces = namespaces;
            namespace.classes = classes;
            namespace.interfaces = interfaces;
            namespace.methods = methods;
            namespace.properties = properties;

            return namespace;
        });
    }
}

export = NamespaceProcedures;
