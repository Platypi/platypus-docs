import ds = require('./datastructures');
import types = require('./docnodes');

var linkReg = /\{@link (.*?)[|](.*?)\}/g;

var linkToMarkup = (content: string, baseURI: string): string => {
    return content.replace(linkReg, (value: string, qualifiedPath: string, linkValue: string, index) => {
        // build path using id/kind/name
        var node: types.INode = ds.nameHashTable[qualifiedPath],
            keyCount: number = Object.keys(ds.nameHashTable).length;

        if (!node) {
            node = ds.nameHashTable[qualifiedPath.toUpperCase()];
        }

        if (keyCount > 0) {
            if (node && node.id) {
                var path: string = baseURI + node.id + '/' + node.kind + '/' + node.name_;

                return '[' + linkValue + '](' + path + ')';
            } else {
                console.log(qualifiedPath + ' not found');

                return value;
            }
        } else {
            console.log('namehash is empty');
            return value;
        }

    });
};

export = linkToMarkup;