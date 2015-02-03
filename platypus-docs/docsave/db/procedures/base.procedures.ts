/// <reference path="../../../_references.ts" />


import utils = require('../../../utils/utils');
import PromiseStatic = require('es6-promise');
import pool = require('../connection');
import mysql = require('mysql');

var Promise = PromiseStatic.Promise;

class BaseProcedures<T extends INode> {
    static query(sql: string): Thenable<any>;
    static query(sql: string, values?: Array<any>): Thenable<any>;
    static query(sql: string, values?: Array<any>): Thenable<any> {
        return new Promise((resolve, reject) => {
            pool.getConnection((err: any, connection: mysql.IConnection) => {
                if (utils.isObject(err)) {
                    return reject(err);
                } else if (utils.isArray(values)) {
                    sql = connection.format(sql, values);
                }

                connection.query(sql, (err: any, response: Array<any>) => {
                    connection.release();
                    if (utils.isObject(err)) {
                        console.log('Error on sql: ' + sql);
                        return reject(err);
                    }

                    if (utils.isArray(response)) {
                        response.pop();
                    }

                    resolve(response);
                });
            });
        });
    }

    static formatArguments(array: Array<any>) {
        if (!utils.isArray(array) || array.length === 0) {
            return '();';
        }

        var sql = '(';

        for (var i = 0, length = array.length - 1; i < length; ++i) {
            sql += '?, ';
        }

        sql += '?);';

        return sql;
    }

    static callProcedure(procedure: string, args: Array<any> = []): Thenable<any> {
        return BaseProcedures.query('CALL ' + procedure + BaseProcedures.formatArguments(args), args);
    }

    constructor(public procedure: string) { }

    all(): Thenable<Array<any>> {
        return this.callProcedure('Get' + this._getAllProcedure(this.procedure), [0, 0]).then((results) => {
            return results[0];
        });
    }

    _getAllProcedure(procedure: string) {
        return procedure + 's';
    }

    create(obj: T): Thenable<number> {
        if (!utils.isObject(obj)) {
            return Promise.resolve(null);
        }
        return this.callProcedure('Insert' + this.procedure, this.getArgs(obj)).then((results) => {
            obj.id = results[0][0].id;
            return obj.id;
        });
    }

    read(id: number, ...args: any[]): Thenable<T> {
        return this.callProcedure('Get' + this.procedure, [id].concat(args));
    }

    update(obj: T) {
        if (!utils.isObject(obj)) {
            return Promise.resolve(null);
        }
        return this.callProcedure('Update' + this.procedure, [obj.id].concat(this.getArgs(obj)));
    }

    destroy(id: number): Thenable<T> {
        return this.callProcedure('Delete' + this.procedure, [id]).then((rows: Array<T>) => {
            return rows[0];
        });
    }

    query(sql: string): Thenable<any>;
    query(sql: string, values?: Array<any>): Thenable<any>;
    query(sql: string, values?: Array<any>): Thenable<any> {
        return BaseProcedures.query(sql, values);
    }

    callProcedure(procedure: string, args: Array<any> = []): Thenable<any> {
        return BaseProcedures.callProcedure(procedure, args);
    }

    getArgs(obj: any) {
        console.log('Should be implementing getArgs for procedure: ' + this.procedure);
        return [];
    }

    formatArguments(array: Array<any>) {
        return BaseProcedures.formatArguments(array);
    }
}

export = BaseProcedures;

 