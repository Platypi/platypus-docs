/// <reference path="../../typings/tsd.d.ts" />
import mysql = require('mysql');

var cfg = require('../../../dbconnection.json') || {};

var connection = mysql.createConnection({
    host: cfg.database.host,
    user: cfg.database.user,
    password: cfg.database.pass,
    database: cfg.database.db
});

connection.connect();

console.log('connected');

connection.end();
