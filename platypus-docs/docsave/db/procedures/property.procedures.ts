/// <reference path="../../../typings/tsd.d.ts" />
/// <reference path="../db.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/property.model');

class PropertyProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Property');
    }

    _getAllProcedure() {
        return this.procedure.substr(0, this.procedure.length - 1) + 'ies';
    }

    getArgs(property: model.IProperty): Array<any> {
        if (!utils.isObject(property)) {
            return [];
        }

        return [
            property.namespaceid,
            property.classid,
            property.interfaceid,
            property.name,
            property.type,
            property.classtypeid,
            property.interfacetypeid,
            property.methodtypeid,
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
 