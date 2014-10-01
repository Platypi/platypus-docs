import flatEvent = require('./populateflat.event');
import graphEvent = require('./graphgen.event');
import savedEvent = require('./savednode.event');
import completeEvent = require('./complete.event');
import errorEvent = require('./error.event');

class DocEvents {
    static setupEvents() {
        errorEvent();
        flatEvent();
        graphEvent();
        savedEvent();
        completeEvent();
    }
}

export = DocEvents;
