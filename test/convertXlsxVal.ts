export type XlsxType = 'string' | 'number';
export function convertXlsxVal(val: string, type: XlsxType | XlsxType[]) {
    if (typeof type !== 'object') {
        return convertPrimType(val, type);
    }
    if (isCantSplit(val)) {
        if (isEmpty(val)) {
            return null;
        }
        return val;
    }
    const val_arr = splitVal(val);
    return convertArrVal(val_arr as any[], type);
}

function convertPrimType(ori_val: string, type: XlsxType) {
    if (type === 'number') {
        const result = Number(ori_val);
        return result === result ? result : null;
    }
    if (type === 'string') {
        return ori_val ? ori_val + '' : null;
    }
}

const split_sign = ['|', ';', ','];
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
function convertArrVal(val: any[], type: XlsxType[]): any[] {
    /** 0 就相当于空 */
    if (Number(val) === 0) {
        return null;
    }
    const result = [];
    for (let i = 0; i < val.length; i++) {
        const item = val[i];
        if (typeof item !== 'object') {
            result.push(convertPrimType(item, type[i] || type[0]));
        } else {
            result.push(convertArrVal(item, type));
        }
    }

    return result;
}

function isEmpty(ori_val: string) {
    if (Number(ori_val) === 0) {
        return true;
    }
    if (!ori_val) {
        return true;
    }
    return false;
}
