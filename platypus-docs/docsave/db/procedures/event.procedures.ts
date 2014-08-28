/// <reference path="../../../typings/tsd.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/event.model');

class EventProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Event');
    }

    getArgs(ev: model.IEvent) {
        if (!utils.isObject(ev)) {
            return [];
        }

        return [
            ev.classid,
            ev.name,
            ev.description,
            ev.remarks,
            ev.example,
            ev.exampleurl
        ];
    }
}

export = EventProcedures;
 