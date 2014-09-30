import flatEvent = require('./populateflat.event');
import graphEvent = require('./graphgen.event');
import savedEvent = require('./savednode.event');
import completeEvent = require('./complete.event');

class DocEvents {
    static setupEvents() {
        flatEvent();
        graphEvent();
        savedEvent();
        completeEvent();
    }
}

export = DocEvents;
