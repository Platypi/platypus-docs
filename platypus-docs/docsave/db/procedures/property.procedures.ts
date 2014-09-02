/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/property.model');
import DocNodeTypes = require('../../../docnodes');

class PropertyProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Property');
    }

    _getAllProcedure() {
        return this.procedure.substr(0, this.procedure.length - 1) + 'ies';
    }

    getArgs(property: DocNodeTypes.IPropertyNode): Array<any> {
        if (!utils.isObject(property)) {
            return [];
        }

        return [
            property.namespace.id,
            property.class.id,
            property.interface.id,
            property.name_,
            property.type,
            property.classtype.id,
            property.interfacetype.id,
            property.methodtype.id,
            property.description,
            property.remarks,
            property.visibility,
            property.static,
            property.readonly,
            property.returntypedesc,
            property.overrides,
            property.optional
        ];
    }

    read(id: number) {
        return super.read(id).then((sets: any) => {
            return sets[0][0];
        });
    }
}

export = PropertyProcedures;
 