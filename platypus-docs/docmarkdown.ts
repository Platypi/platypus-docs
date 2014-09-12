import ds = require('./datastructures');

var linkReg = /\{@link (.*?)[|](.*?)\}/g;

var linkToMarkup = (content: string, baseURI: string): string => {
    // use namehash here
    return content.replace(linkReg, (value, qualifiedPath, linkValue, index) => {
        return '[' + qualifiedPath + '](' + linkValue + ')';
    });
};

export = linkToMarkup;