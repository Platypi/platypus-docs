/// <reference path="../../typings/tsd.d.ts" />
import mysql = require('mysql');

var cfg = require('../../../dbconnection.json') || {};

var connection = mysql.createConnection({
    host: cfg.database.host,
    user: cfg.database.user,
    password: cfg.database.password,
    database: cfg.database.dbName
});

console.log('connecting to: ' + cfg.database.host);

connection.connect(() => {
    console.log('connected');
    connection.end();
});

connection.on('error', (err: mysql.IError) => {
    if (err) {
        console.log(err);
        connection.destroy();
    }
});
