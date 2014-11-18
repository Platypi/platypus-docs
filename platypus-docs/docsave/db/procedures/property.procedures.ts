/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class PropertyProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Property');
    }

    _getAllProcedure() {
        return this.procedure.substr(0, this.procedure.length - 1) + 'ies';
    }

    getArgs(property: IPropertyNode): Array<any> {
        if (!utils.isObject(property)) {
            return [];
        }

        var parent = property.parent_,
            namespaceid: number = null,
            classid: number = null,
            interfaceid: number = null;

        switch (parent.kind) {
            case 'namespace':
                namespaceid = parent.id;
                break;
            case 'class':
                classid = parent.id;
                break;
            case 'interface':
                interfaceid = parent.id;
                break;
        }
        return [
            namespaceid,
            classid,
            interfaceid,
            property.name_,
            property.type,
            null, // property.classtype.id,
            null, // property.interfacetype.id,
            null, // property.methodtype.id,
            property.description_,
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
 