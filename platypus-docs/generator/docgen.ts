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
        /*
         * Build the necessary data structures from an input file.
         * 
         * @param src The path to the input file.
         * @param debug A flag to turn on/off debugging information.
         */
        buildGraphFromFile(src: string): Thenable<any> {
            if (!fs.existsSync(src)) {
                throw new Error('Source file does not exist!');
            }
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

        /*
         * Handles the parsed comments, passes them to the graph handler.
         * 
         * @param err Any errors that come from the parser.
         * @param data Data returned from the parser.
         */
        private __parsedCommentsHandler(err: any, data: any): Thenable<any> {
            if (!err) {
                return this.__graphGen(data).then((graph) => {
                    return this.__graphHandler(graph);
                });
            } else {
                console.log(new Error(err));
            }
        }

        /*
         * Sets the datastructure for the returned graph.
         * 
         * @param graph The graph returned from the graph generator.
         */
        private __graphHandler (graph: any): Thenable<any> {
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
