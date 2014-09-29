/// <reference path="../_references.ts" />

import BaseHandler = require('./base.handler');
import ds = require('../variables/datastructures');

class EventHandler extends BaseHandler {
    static MakeNewEventNode (tag: IParsedDocNode) {
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
    }

    static addToDataStructures(tag: IParsedDocNode): void {
        var newEvent = EventHandler.MakeNewEventNode(tag),
            eventName = EventHandler.handleName(newEvent);

        ds.flat.events[eventName] = newEvent;
        ds.nameHashTable[eventName] = ds.flat.events[eventName];

    }
}

export = EventHandler;