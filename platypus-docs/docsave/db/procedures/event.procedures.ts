/// <reference path="../../../_references.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class EventProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Event');
    }

    getArgs(ev: IEvent) {
        if (!utils.isObject(ev)) {
            return [];
        }

        return [
            ev.class.id_,
            ev.name_,
            ev.description_,
            ev.remarks
        ];
    }
}

export = EventProcedures;
 