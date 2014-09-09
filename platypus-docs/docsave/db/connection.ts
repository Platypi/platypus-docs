/// <reference path="../../typings/tsd.d.ts" />
import mysql = require('mysql');
import utils = require('../../utils/utils');

var cfg = require('../../../dbconnection.json') || {};

var pool = mysql.createPool({
    host: cfg.database.host,
    user: cfg.database.user,
    password: cfg.database.password,
    database: cfg.database.dbName,
    connectionLimit: 5
});

pool.on('connection', (connection: mysql.IConnection) => {
    connection.on('error', (err: mysql.IError) => {
        if (utils.isObject(err)) {
            console.log(err);
            connection.destroy();
        }
    });
});

export = pool;