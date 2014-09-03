/// <reference path="../db.d.ts" />
/// <reference path="../../../typings/tsd.d.ts" />


import base = require('./api.procedures');
import utils = require('../../../utils/utils');
import model = require('../models/class.model');
import DocNodeTypes = require('../../../docnodes');

class ClassProcedures extends base.ApiProcedures<any> {
    constructor() {
        super('Class');
    }

    _getAllProcedure() {
        return this.procedure + 'es';
    }

    getArgs(c: DocNodeTypes.IClassNode): Array<any> {
        if (!utils.isObject(c)) {
            return [];
        }

        //var args = [
        //    (c.extends ? c.extends.id : null),
        //    (c.namespace ? c.namespace.id : null),
        //    c.name_,
        //    c.description_,
        //    c.example,
        //    c.exampleurl,
        //    c.remarks,
        //    c.exported,
        //    c.static,
        //    c.registeredtype,
        //    c.registeredname
        //];

        //if (c.name_ === 'WebViewControl') {
        //    console.log(args);
        //}

        return [
            (c.extends ? c.extends.id : null),
            (c.namespace ? c.namespace.id : null),
            c.name_,
            c.description_,
            c.example,
            c.exampleurl,
            c.remarks,
            c.exported,
            c.static,
            c.registeredtype,
            c.registeredname
        ];
    }

    read(id: number, overloads?: boolean) {
        return super.read(id, !overloads).then((sets: db.docs.api.rowsets.IGetClassRowSets) => {
            var inherits = sets[0],
                namespace = sets[1][0],
                children = sets[2],
                interfaces = sets[3],
                methods = sets[4],
                methodparameters = sets[5],
                methodtypeparameters = sets[6],
                properties = sets[7],
                typeparameters = sets[8],
                events = sets[9],
                c = inherits.pop();

            c.inherits = inherits;
            c.namespace = namespace;
            c.children = children;
            c.interfaces = interfaces;
            c.methods = this.mergeParameters(methods, methodparameters, methodtypeparameters);
            c.properties = properties;
            c.typeparameters = typeparameters;
            c.events = events;
            c.namespaceid = c.namespace.id;
            return c;
        });
    }

    mergeParameters(methods: Array<db.docs.api.IMethodsRow>,
        parameters: Array<db.docs.api.IParametersRow>,
        typeParameters: Array<db.docs.api.ITypeParameterRow>): Array<db.docs.api.IMethodsRow> {

        var parameter: db.docs.api.IParametersRow,
            typeParameter: db.docs.api.ITypeParameterRow,
            mId: number;

        utils.forEach(methods, (method) => {
            mId = method.id;
            method.parameters = [];
            method.typeparameters = [];
            parameter = parameters[0];
            typeParameter = typeParameters[0];
            while (parameters.length > 0 && mId === parameter.id) {
                method.parameters.push(parameter);
                parameters.shift();
                parameter = parameters[0];
            }
            while (typeParameters.length > 0 && mId === typeParameter.id) {
                method.typeparameters.push(typeParameter);
                typeParameters.shift();
                typeParameter = typeParameters[0];
            }
        });

        return methods;
    }
}

export = ClassProcedures;
