/// <reference path="../../../typings/tsd.d.ts" />

import base = require('./api.procedure');
import utils = require('../../../utils/utils');

class InterfaceInterfaceProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('InterfaceInterface');
    }

    getArgs(i: any) {
        if (!utils.isObject(i)) {
            return [];
        }

        return [
            i.interfaceid,
            i.extendsinterfaceid
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


export = InterfaceInterfaceProcedures;
 