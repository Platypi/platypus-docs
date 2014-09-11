var linkReg = /\{@link (.*?)[|](.*?)\}/g;

var linkToMarkup = (content: string, baseURI: string, id: number): string => {
    return content.replace(linkReg, (value, qualifiedPath, linkValue, index) => {
        console.log('covnerted: ' + content + ' to ' + '[' + qualifiedPath + '](' + linkValue + ')');
        return '[' + qualifiedPath + '](' + linkValue + ')';
    });
};

export = linkToMarkup;