/// <reference path="../../../typings/tsd.d.ts" />

import base = require('./api.procedures');
import utils = require('../../../utils/utils');

class ClassInterfaceProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('ClassInterface');
    }

    getArgs(i: any) {
        if (!utils.isObject(i)) {
            return [];
        }

        return [
            i.id,
            i.extendedId
        ];
    }

    create(obj: any): Thenable<number> {
        if (!utils.isObject(obj)) {
            return Promise.resolve(null);
        }
        return this.callProcedure('Insert' + this.procedure, this.getArgs(obj)).then(() => {
            return obj;
        });
    }
}


export = ClassInterfaceProcedures;
 