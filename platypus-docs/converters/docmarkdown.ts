/// <reference path="../_references.ts" />

/*
 * docmarkdown
 * Uses a regular expression to replace the {@link } tags with markdown links.
 */

import ds = require('../variables/datastructures');
import globals = require('../variables/globals');

var linkReg = /\{@link (.*?)[|](.*?)\}/g;

var linkToMarkup = (content: string, baseURI: string): string => {
    content = content || '';
    return content.replace(linkReg, (value: string, qualifiedPath: string, linkValue: string, index) => {
        // account for Type<Type>
        var typeParamStart = qualifiedPath.indexOf('<');

        if (typeParamStart && typeParamStart > 0) {
            qualifiedPath = qualifiedPath.slice(0, typeParamStart);
        }

        var node: INode = ds.nameHashTable[qualifiedPath],
            keyCount: number = Object.keys(ds.nameHashTable).length;

        if (!node) {
            node = ds.nameHashTable[qualifiedPath.toUpperCase()];
        }

        if (!!node && (<any>node).length > 0) {
            node = node[0];
        }

        if (keyCount > 0) {
            if (node && node.id) {
                // build path using id/kind/name
                return `<plat-link plat-options="{ view: '${baseURI}${node.id}/${node.kind}/${node.name_}', isUrl: true }">
                            ${linkValue}
                         </plat-link>`;
            } else {
                if (globals.debug) {
                    console.log(qualifiedPath + ' not found');
                }

                return linkValue;
            }
        } else {
            console.log('namehash is empty');
            return linkValue;
        }

    });
};

export = linkToMarkup;