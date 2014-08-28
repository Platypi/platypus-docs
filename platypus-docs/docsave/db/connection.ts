/// <reference path="../../typings/tsd.d.ts" />
import mysql = require('mysql');

var cfg = require('../../../dbconnection.json') || {};

var connection = mysql.createConnection({
    host: cfg.database.host,
    user: cfg.database.user,
    password: cfg.database.password,
    database: cfg.database.dbName
});

var getConnection = (cb: (err: any, connection: mysql.IConnection) => void) => {
    console.log('connecting to: ' + cfg.database.host);

    connection.connect(() => {
        console.log('connected');
        cb(null, connection);
    });

    connection.on('error', (err: mysql.IError) => {
        if (err) {
            connection.destroy();
            cb(err, null);
        }
    });
};

export = getConnection;