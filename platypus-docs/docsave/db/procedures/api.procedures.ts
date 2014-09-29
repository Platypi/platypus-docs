/// <reference path="../../../_references.ts" />

import BaseProcedures = require('./base.procedures');
import utils = require('../../../utils/utils');

export class ApiProcedures<T extends INode> extends BaseProcedures<T> {
    static readDocTree(descriptions?: boolean) {
        return BaseProcedures.callProcedure('GetDocTree' + (!!descriptions ? 'WithDesc' : ''), [])
            .then<any>((tree: db.docs.api.rowsets.IDocTreeRowSets) => {

            ApiProcedures.tree = tree;

            var namespaces: Array<db.docs.api.INamespaceRow> = [];

            var length = tree[0].length,
                namespace: db.docs.api.INamespaceRow;

            for (var i = length - 1; i >= 0; --i) {
                namespace = tree[0][i];

                if (!utils.isNumber(namespace.parentid)) {
                    namespaces.push(tree[0].splice(i, 1)[0]);
                }
            }

            namespaces.forEach(ApiProcedures.joinNamespace);
            ApiProcedures.tree = undefined;

            return namespaces;
        });
    }

    static getDocsByName(name): Thenable<Array<any>> {
        return BaseProcedures.callProcedure('GetDocsByName', [name]).then((results) => {
            return results[0];
        });
    }

    private static tree: db.docs.api.rowsets.IDocTreeRowSets;

    static joinNamespace(n: db.docs.api.INamespaceRow) {
        var join = ApiProcedures.joinChildren,
            tree = ApiProcedures.tree;

        n.classes = [];
        n.interfaces = [];
        n.methods = [];
        n.namespaces = [];
        n.properties = [];
        n.doctype = 'namespace';

        join(n, tree[0], 'namespaces');
        join(n, tree[1], 'methods');
        join(n, tree[2], 'properties');
        join(n, tree[3], 'classes');
        join(n, tree[6], 'interfaces');
    }

    static joinClass(c: db.docs.api.IClassRow) {
        var join = ApiProcedures.joinChildren,
            tree = ApiProcedures.tree;

        c.methods = [];
        c.properties = [];
        c.doctype = 'class';

        join(c, tree[4], 'methods');
        join(c, tree[5], 'properties');
    }

    static joinInterface(i: db.docs.api.IInterfaceRow) {
        var join = ApiProcedures.joinChildren,
            tree = ApiProcedures.tree;

        i.methods = [];
        i.properties = [];
        i.doctype = 'interface';

        join(i, tree[7], 'methods');
        join(i, tree[8], 'properties');
    }

    static joinChildren(obj: any, children: Array<any>, childType: string) {
        var doctype = obj.doctype,
            id = obj.id,
            length = children.length,
            child: any,
            array: Array<any> = [],
            joinFn: (child: any) => void,
            objId: string = 'id';

        if (length <= 0) {
            return;
        }

        switch (doctype) {
            case 'namespace':
                if (!utils.isUndefined(children[0].parentid)) {
                    doctype = 'parent';
                    objId = 'parentid';
                } else {
                    objId = 'namespaceid';
                }
                break;
            case 'class':
                objId = 'classid';
                break;
            case 'interface':
                objId = 'interfaceid';
                break;
        }

        switch (childType) {
            case 'namespaces':
                joinFn = ApiProcedures.joinNamespace;
                break;
            case 'classes':
                joinFn = ApiProcedures.joinClass;
                break;
            case 'interfaces':
                joinFn = ApiProcedures.joinInterface;
                break;
        }


        var isTree = utils.isFunction(joinFn),
            childrenToJoin = [];

        for (var i = length - 1; i >= 0; --i) {
            child = children[i];

            if (child[objId] === id) {
                array.push(child);
                children.splice(i, 1);

                if (isTree) {
                    childrenToJoin.push(child);
                } else if (childType === 'methods') {
                    child.doctype = 'method';
                } else if (childType === 'properties') {
                    child.doctype = 'property';
                }
            }
        }

        if (utils.isFunction(joinFn)) {
            utils.forEach(childrenToJoin, joinFn);
        }

        obj[childType] = obj[childType].concat(array);
    }
}
 