var __nativeIsArray = !!Array.isArray;

export function noop(): void { }

export function extend(destination: any, ...sources: any[]): any {
    if (isNull(destination)) {
        return destination;
    }

    var deep = isBoolean(destination);

    if (deep) {
        destination = sources.shift();
    }

    var keys: Array<string>,
        property: any;

    forEach(sources, (source, k) => {
        if (!isObject(source)) {
            return;
        }

        keys = Object.keys(source);

        forEach(keys, (key) => {
            property = source[key];
            if (deep) {
                if (isArray(property)) {
                    extend(deep, destination[key] || (destination[key] = []), property);
                    return;
                } else if (isDate(property)) {
                    destination[key] = new Date(property.getTime());
                    return;
                } else if (isRegExp(property)) {
                    destination[key] = new RegExp(property);
                    return;
                } else if (isNode(property)) {
                    destination[key] = (<Node>property).cloneNode(true);
                    return;
                } else if (isObject(property)) {
                    extend(deep, destination[key] || (destination[key] = {}), property);
                    return;
                }
            }
            destination[key] = property;
        });
    });

    return destination;
}

export function deepExtend(destination: any, ...sources: any[]): any {
    return extend.apply(null, [true, destination].concat(sources));
}

export function _clone(obj: any, deep?: boolean) {
    if (!isObject(obj)) {
        return obj;
    } else if (isDate(obj)) {
        return new Date((<Date>obj).getTime());
    } else if (isRegExp(obj)) {
        return new RegExp(obj);
    } else if (isNode(obj)) {
        return (<Node>obj).cloneNode(deep);
    } else if (isError(obj)) {
        return new obj.constructor((<Error>obj).message);
    }

    var type = {};

    if (isArray(obj)) {
        type = [];
    }

    if (isBoolean(deep) && deep) {
        return deepExtend(type, obj);
    }

    return extend(type, obj);
}

export function isError(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Error]';
}

export function isObject(obj: any): boolean {
    return obj != null && typeof obj === 'object';
}

export function isWindow(obj: any): boolean {
    return !!(obj && obj.document && obj.setInterval);
}

export function isDocument(obj: any): boolean {
    return !!(obj && obj.nodeType === Node.DOCUMENT_NODE);
}

export function isNode(obj: any): boolean {
    return !!(obj && typeof obj.nodeType === 'number');
}

export function isDocumentFragment(obj: any): boolean {
    return !!(obj && (<Node>obj).nodeType === Node.DOCUMENT_FRAGMENT_NODE);
}

export function isFile(obj: any): boolean {
    return isObject(obj) && obj.toString() === '[object File]';
}

export function isString(obj: any): boolean {
    return typeof obj === 'string';
}

export function isRegExp(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object RegExp]';
}

export function isPromise(obj: any): boolean {
    return isObject(obj) && (obj.toString() === '[object Promise]' || isFunction(obj.then));
}

export function isEmpty(obj: any): boolean {
    if (isNull(obj)) {
        return true;
    }

    if (isString(obj) || isArray(obj)) {
        return obj.length === 0;
    }

    if (!isObject(obj)) {
        return false;
    }

    return Object.keys(obj).length === 0;
}

export function isBoolean(obj: any): boolean {
    return typeof obj === 'boolean';
}

export function isNumber(obj: any): boolean {
    return typeof obj === 'number' && !isNaN(obj);
}

export function isFunction(obj: any): boolean {
    return typeof obj === 'function';
}

export function isNull(obj: any): boolean {
    return obj === null || obj === undefined;
}

export function isUndefined(obj: any): boolean {
    return obj === undefined;
}

export function isArray(obj: any): boolean {
    if (__nativeIsArray) {
        return Array.isArray(obj);
    }

    return Object.prototype.toString.call(obj) === '[object Array]';
}

export function isArrayLike(obj: any): boolean {
    if (isNull(obj) || isWindow(obj) || isFunction(obj)) {
        return false;
    }

    return isString(obj) || obj.length >= 0;
}

export function isDate(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Date]';
}

export function filter<T>(obj: any, iterator: (value: T, key: any, obj: any) => boolean, context?: any): Array<T> {
    var arr: Array<T> = [];
    if (isNull(obj)) {
        return arr;
    }

    if (isFunction(obj.filter)) {
        return obj.filter(iterator, context);
    }

    forEach<T>(obj, (value: T, key: any, obj: any) => {
        if (iterator(value, key, obj)) {
            arr.push(value);
        }
    });

    return arr;
}

export function where(obj: any, properties: any): Array<any> {
    return filter(obj, (value)
        => !some(properties, (property, key)
            => (<any>value)[key] !== property));
}

export function forEach<T>(array: Array<T>, iterator: (value: T, index: number, obj: any) => void, context?: any): Array<T>;
export function forEach<T>(obj: any, iterator: (value: T, key: string, obj: any) => void, context?: any): any;
export function forEach<T>(obj: any, iterator: (value: T, key: any, obj: any) => void, context?: any): any {
    if (isNull(obj) || !(isObject(obj) || isArrayLike(obj))) {
        return obj;
    }

    var i: number,
        key: string,
        length: number;

    if (isFunction(obj.forEach)) {
        return obj.forEach(iterator, context);
    } else if (isArrayLike(obj)) {
        for (i = 0, length = obj.length; i < length; ++i) {
            iterator.call(context, obj[i], i, obj);
        }
    } else {
        var keys = Object.keys(obj);
        length = keys.length;
        while (keys.length > 0) {
            key = keys.shift();
            iterator.call(context, obj[key], key, obj);
        }
    }

    return obj;
}

export function map<T, U>(obj: any, iterator: (value: T, key: any, obj: any) => U, context?: any): Array<U> {
    var arr: Array<U> = [];

    if (isNull(obj)) {
        return arr;
    }

    if (isFunction(obj.map)) {
        return obj.map(iterator, context);
    }

    forEach(obj, (value, key) => {
        arr.push(iterator.call(context, value, key, obj));
    });

    return arr;
}

export function pluck<T, U>(obj: any, key: string): Array<U> {
    return map<T, U>(obj, (value) => (<any>value)[key]);
}

export function some<T>(obj: Array<T>, iterator: (value: T, key: any, obj: any) => boolean, context?: any): boolean;
export function some<T>(obj: { [key: string]: T; }, iterator: (value: T, key: any, obj: any) => boolean, context?: any): boolean;
export function some<T>(obj: any, iterator: (value: T, key: any, obj: any) => boolean, context?: any): boolean {
    if (isNull(obj) || isFunction(obj)) {
        return false;
    }

    var i: number,
        key: string,
        length: number,
        ret: boolean;

    if (isFunction(obj.some)) {
        return obj.some(iterator, context);
    } else if (isArrayLike(obj)) {
        for (i = 0, length = obj.length; i < length; ++i) {
            ret = iterator.call(context, obj[i], i, obj);
            if (ret === true) {
                return true;
            }
        }
    } else {
        var keys = Object.keys(obj);
        length = keys.length;
        while (keys.length > 0) {
            key = keys.shift();
            ret = iterator.call(context, obj[key], key, obj);
            if (ret === true) {
                return true;
            }
        }
    }

    return false;
}

export function omit<T>(obj: T, keys: Array<string>): T {
    var copy = <T>{};

    forEach(obj, (value, key) => {
        if (keys.indexOf(key) === -1) {
            copy[key] = obj[key];
        }
    });

    return copy;
}

export interface IRemoveListener {
    (): void;
}

export function postpone(method: (...args: any[]) => void, args?: Array<any>, context?: any): IRemoveListener {
    return defer(method, 0, args, context);
}

export function defer(method: (...args: any[]) => void, timeout: number, args?: Array<any>, context?: any): IRemoveListener {
    function defer() {
        method.apply(context, args);
    }

    var timeoutId = setTimeout(defer, timeout);

    return () => {
        clearTimeout(timeoutId);
    };
}

var camelCaseRegex: RegExp = /([\-_\.\s])(\w+?)/g;

export function camelCase(str: string): string {
    if (!isString(str) || isEmpty(str)) {
        return str;
    }

    str = str.charAt(0).toLowerCase() + str.substr(1);

    return str.replace(camelCaseRegex,
        (match: string, delimiter?: string, char?: string, index?: number)
            => index ? char.toUpperCase() : char);
}
 