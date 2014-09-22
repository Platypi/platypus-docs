import BaseHandler = require('./base.handler');
import utils = require('../utils/utils');
import types = require('../docnodes');
import tags = require('../tagbuilder');

class MethodHandler extends BaseHandler {
    static MakeNewMethodNode = (tag: tags.ParsedDocNode): types.IMethodNode => {
        var memberof: string = (tag.memberof ? (<string>tag.memberof.name).trim() : '');

        // if name is blank, the method is an interface
        var newMethod: types.IMethodNode = {
            name_: (tag.name ? tag.name.name : ''),
            description_: tag.description.description,
            kind: 'method',
            overrides: (tag.variation ? true : false),
            visibility: (tag.access ? tag.access.name : 'public'),
            static: (tag.static ? true : false),
            remarks: (tag.remarks ? tag.remarks.description : ''),
            published: (!tag.published ? true : (tag.published.name !== 'false')),
            exported: (!tag.exported ? true : (tag.exported.name !== 'false')),
            //typeparamaters: (parsedDocTags.typeparams ? parsedDocTags.typeparams.name : ''),
            returntype: (tag.returns ? tag.returns.type : ''),
            returntypedesc: (tag.returns ? tag.returns.name + ' ' + tag.returns.description : ''),
            optional: (tag.optional ? true : false),
            parameters: {},
            memberof: memberof
        };

        // push the params onto the tmpObj
        if (tag.params) {
            for (var z = 0; z < tag.params.length; z++) {
                var newParameter: types.IParameterNode = {
                    name_: tag.params[z].name,
                    memberof: tag.params[z].memberof,
                    kind: 'parameter',
                    type: tag.params[z].type,
                    description_: tag.params[z].description,
                    published: true,
                    exported: (!tag.exported ? true : false),
                    porder: z
                };

                // determine if the parameter is optional 
                if (newParameter.name_.indexOf('?') > 0) {
                    newParameter.name_ = newParameter.name_.slice(0, newParameter.name_.indexOf('?'));
                    newParameter.optional = true;
                }

                newMethod.parameters[newParameter.name_ + '_'] = newParameter;
            }
        }
        
        BaseHandler.handleTypeParams(tag.typeparams, newMethod);

        return newMethod;
    };
}

export = MethodHandler;