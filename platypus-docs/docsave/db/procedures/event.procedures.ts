/// <reference path="../../../typings/tsd.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/event.model');
import DocNodeTypes = require('../../../docnodes');

class EventProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Event');
    }

    getArgs(ev: DocNodeTypes.IEvent) {
        if (!utils.isObject(ev)) {
            return [];
        }

        return [
            ev.class.id,
            ev.name_,
            ev.description,
            ev.remarks
        ];
    }
}

export = EventProcedures;
 