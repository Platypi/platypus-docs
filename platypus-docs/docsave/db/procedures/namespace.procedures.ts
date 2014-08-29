﻿/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/namespace.model');

class NamespaceProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Namespace');
    }

    getArgs(namespace: model.INamespace): Array<any> {
        if (!utils.isObject(namespace)) {
            return [];
        }

        return [
            namespace.parentid,
            namespace.name,
            namespace.description
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