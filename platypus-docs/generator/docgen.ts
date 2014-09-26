/// <reference path="../typings/tsd.d.ts" />


/*
 * DocGen
 * Generates the document graph.
 */

import fs = require('fs');
import ds = require('../variables/datastructures');

var parser = require('comment-parser');

export module DocGen {
    
    /**
     * Generate Docs from source file.
     */
    export class DocGenerator {

        nameHash = ds.nameHashTable;

        callback = (graph) => { };

        debug = false;

        buildGraphFromFile = (src: string, callback: (graph) => void, debug: boolean = false) => {
            this.debug = debug;
            if (callback) {
                this.callback = callback;
            }

            fs.readFile(src, {
                encoding: 'utf8'
            }, (err, data) => {
                this.__parsedCommentsHandler(err, data && parser(data.toString()));
            });
        };

        private __parsedCommentsHandler = (err: any, data: any) => {
            if (!err) {
                this.__graphGen(data, this.__graphHandler);
            } else {
                console.log(new Error(err));
            }
        };


        private __graphHandler = (graph: any) => {
            if (this.debug) {
                console.log(JSON.stringify(graph, censor(graph), 4));
            }

            if (this.callback) {
                ds.nameHashTable = this.nameHash;
                this.callback(graph);
            }
        };

        /**
         * Generate a graph of tags as they appear in code.
         */
        private __graphGen = (tags: any, callback: (graph: any) => void) => {
            /*
             * First run through will generate a flat 
             * data structure as we may not yet have all the tags
             * need to reference each other in memory.
             */

            /**
             * Two loops are needed as the output of the parser 
             * results in nested tags.
             */
            ds.populateFlat(tags);

            /*
             * Convert the flat data structure into a graph.
             */
            ds.flat2Graph();

            callback(ds.graph);
        };
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