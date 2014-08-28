/// <reference path="../../../typings/tsd.d.ts" />

import base = require('./base.model');

export class ApiModel<T extends base.IBaseModel> extends base.BaseModel<T> { }

export interface IBaseDoc extends base.IBaseModel {

}

export interface IApiModel extends base.IBaseModel {
    id?: number;
    name?: string;
    description?: string;
    published?: boolean;
}

export interface IDocTree {

}
