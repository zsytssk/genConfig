import { state } from './gen';

enum PrimType {
    int = 'int',
    double = 'double',
    string = 'string',
}
type multiType = {
    type: 'multiType';
    type_arr: PrimType[];
};
export type ItemType = PrimType | PrimType[] | multiType;
export function calcItemType(type_str: string): ItemType {
    if (PrimType[type_str]) {
        return PrimType[type_str];
    }
    if (type_str.split('|').length > 1) {
        const type_or_arr = type_str.split('|');
        const result = [];
        for (const item of type_or_arr) {
            result.push(calcItemType(item));
        }
        return {
            type: 'multiType',
            type_arr: result,
        };
    }
    const reg_arr = /Array<([^\s]+)>/g;
    const match = reg_arr.exec(type_str);
    if (!match) {
        return undefined;
    }
    const type_arr = match[1].split(',');
    const result = [];
    for (const item of type_arr) {
        result.push(calcItemType(item));
    }
    return result;
}

export function calcType(type_str_arr: string[]): ItemType[] {
    const result: ItemType[] = [];
    for (const item of type_str_arr) {
        result.push(calcItemType(item));
    }
    return result;
}

export function convertPrimType(ori_val, type: PrimType) {
    if (type === PrimType.int || type === PrimType.double) {
        const result = Number(ori_val);
        return result === result ? result : null;
    }
    if (type === PrimType.string) {
        return ori_val ? ori_val + '' : null;
    }
}

export function convertType(ori_val, type: ItemType) {
    if (typeof type !== 'object') {
        return convertPrimType(ori_val, type);
    }
    if ((type as multiType).type === 'multiType') {
        const type_arr = (type as multiType).type_arr;
        let result;
        for (const type_item of type_arr) {
            result = convertType(ori_val, type_item);
            if (result !== null) {
                break;
            }
        }
        return result;
    }

    if (isArrayEmpty(ori_val)) {
        return null;
    }
    const val_arr = splitVal(ori_val);
    return convertArrVal(val_arr as any[], type);
}

function splitVal(ori_val: string, index: number = 0) {
    /** 第一层 0 就相当于空 */
    const split_sign = ['|', ';', ','];
    if (isCantSplit(ori_val, split_sign)) {
        return ori_val;
    }

    const val_arr = ori_val.split(split_sign[index]);
    if (val_arr.length === 1) {
        return splitVal(ori_val, index + 1);
    }

    const result = [];
    for (const item of val_arr) {
        result.push(splitVal(item, index + 1));
    }
    return result;
}

function isCantSplit(ori_val: string, split_sign: string[]) {
    for (const item of split_sign) {
        if (ori_val.indexOf(item) !== -1) {
            return false;
        }
    }
    return true;
}

function isArrayEmpty(ori_val: string) {
    if (Number(ori_val) === 0) {
        return true;
    }
    if (!ori_val) {
        return true;
    }
    return false;
}

function convertArrVal(val: any[], type: ItemType): any[] {
    /** 0 就相当于空 */
    if (Number(val) === 0) {
        return null;
    }

    const result = [];
    for (let i = 0; i < val.length; i++) {
        const item = val[i];
        if (typeof item !== 'object') {
            result.push(convertPrimType(item, type[i] || (type[0] as ItemType)));
        } else {
            result.push(convertArrVal(item, type));
        }
    }

    return result;
}
