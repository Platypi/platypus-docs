/// <reference path="../_references.ts" />

import BaseHandler = require('./base.handler');
import tags = require('../tags/tagbuilder');

class EventHandler extends BaseHandler {
    static MakeNewEventNode = (tag: IParsedDocNode) => {
        var newEvent: IEvent = {
            name_: tag.name.name,
            kind: tag.kind.name,
            description_: tag.description.description,
            published: (!tag.published ? true : (tag.published.name !== 'false')),
            exported: (!tag.exported ? true : (tag.exported.name !== 'false')),
            visibility: (tag.access ? tag.access.name : 'public'),
            remarks: (tag.remarks ? tag.remarks.description : ''),
            classNameString: tag.class.name,
            memberof: (tag.memberof ? tag.memberof.name : '')
        };

        return newEvent;
    };
};

export = EventHandler;