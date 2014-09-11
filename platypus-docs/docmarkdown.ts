var linkReg = /\{@link (.*?)[|](.*?)\}/g;

var linkToMarkup = (content: string, baseURI: string, id: number): string => {
    return content.replace(linkReg, (value, qualifiedPath, linkValue, index) => {
        return '[' + qualifiedPath + '](' + linkValue + ')';
    });
};

export = linkToMarkup;