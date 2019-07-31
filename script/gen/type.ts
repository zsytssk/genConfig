import { addErr, state } from '../state';

enum PrimType {
    int = 'int',
    double = 'double',
    string = 'string',
    keepOrigin = 'keepOrigin',
}
type multiType = {
    type: 'multiType';
    type_arr: PrimType[];
};
const split_sign = ['|', ';', ','];

export type ItemType = PrimType | PrimType[] | multiType;
export function calcItemType(type_str: string): ItemType {
    if (!type_str) {
        return;
    }
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

type ItemInfo = {
    type: ItemType;
    val: string;
};

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
    if (type === PrimType.keepOrigin) {
        return ori_val;
    }
}

export function convertType(ori_val, type: ItemType, is_top = true) {
    if (typeof type !== 'object') {
        return convertPrimType(ori_val, type);
    }

    if ((type as multiType).type === 'multiType') {
        type = PrimType.string;
        addErr(`${state.file_name}:>${state.item_title}`);
        return convertPrimType(ori_val, type);
        // let type_arr = (type as multiType).type_arr;
        // let result = null;
        // type_arr = type_arr.sort((a, b) => {
        //     if (Array.isArray(a)) {
        //         return -1;
        //     }
        //     if (Array.isArray(b)) {
        //         return 1;
        //     }
        // });
        // for (const type_item of type_arr) {
        //     result = convertType(ori_val, type_item, false);
        //     if (result !== null) {
        //         break;
        //     }
        // }
        // return result;
    }

    if (Array.isArray(type)) {
        if (isArrayEmpty(ori_val)) {
            return null;
        }
        if (isCantSplit(ori_val)) {
            /** 如果是数组, 而且只有一个类型, 那么直接转化为只有一个元素的数组
             * 1.5:Array<int> => [1.5]
             */
            if (is_top && type.length === 1) {
                return [convertPrimType(ori_val, type[0])];
            }
            return null;
        }
        const val_arr = splitVal(ori_val);
        return convertArrVal(val_arr as any[], type);
    }
}

function splitVal(ori_val: string, index: number = 0) {
    /** 第一层 0 就相当于空 */
    if (isCantSplit(ori_val)) {
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

function isCantSplit(ori_val: string) {
    if (!ori_val.split) {
        return true;
    }

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
