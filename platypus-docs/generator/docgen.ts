/// <reference path="../_references.ts" />


/*
 * DocGen
 * Generates the document graph.
 */

import fs = require('fs');
import ds = require('../variables/datastructures');
import PromiseStatic = require('es6-promise');

var parser = require('comment-parser'),
    Promise = PromiseStatic.Promise;

export module DocGen {
    
    /**
     * Generate Docs from source file.
     */
    export class DocGenerator {

        nameHash = ds.nameHashTable;

        debug = false;

        buildGraphFromFile (src: string, debug: boolean = false): Thenable<any> {
            this.debug = debug;
            return new Promise((resolve, reject) => {
                fs.readFile(src, {
                    encoding: 'utf8'
                }, (err, data) => {
                        if (err) {
                            reject(err);
                        }
                        this.__parsedCommentsHandler(err, data && parser(data.toString())).then((graph) => {
                            resolve(graph);
                        });
                    });
            });
        }

        private __parsedCommentsHandler(err: any, data: any): Thenable<any> {
            if (!err) {
                return this.__graphGen(data).then((graph) => {
                    return this.__graphHandler(graph);
                });
            } else {
                console.log(new Error(err));
            }
        }


        private __graphHandler (graph: any): Thenable<any> {
            if (this.debug) {
                console.log(JSON.stringify(graph, censor(graph), 4));
            }
            return new Promise((resolve, reject) => {
                ds.nameHashTable = this.nameHash;
                resolve(graph);
            });
        }

        /**
         * Generate a graph of tags as they appear in code.
         */
        private __graphGen(tags: any): Thenable<any> {
            return new Promise((resolve, reject) => {
                /*
                 * Two loops are needed as the output of the parser 
                 * results in nested tags.
                 */
                ds.populateFlat(tags);

                /*
                 * Convert the flat data structure into a graph.
                 */
                ds.flat2Graph();
                resolve(ds.graph);
            });
        }
    }
}

/* 
 * Used for debugging.
 */
function censor(censor) {
    return function (key, value) {
        if (key === 'parent' ||
            key === 'namespace' ||
            key === 'class' ||
            key === 'interface' ||
            key === 'interfaceNode' ||
            key === 'namespaceNode' ||
            key === 'classNode' ||
            key === 'returntype' ||
            key === 'method') {
            if (value && value.name && value.name !== '') {
                return '[Circular] ' + (value ? value.name : '');
            } else {
                return '[Circular] ' + (value ? value.type : '');
            }
        }

        return value;
    };
}