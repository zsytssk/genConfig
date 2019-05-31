import * as xlsx from 'xlsx';

export type XlsxData = Array<
    Array<{
        v: string;
        c: string;
    }>
>;
export function parseXlsx(path: string): XlsxData[] {
    const data = xlsx.readFile(path);
    const { Sheets } = data;

    const result = [];
    /** 只返回第一个表单的结果 */
    for (const [name, sheet_raw_data] of Object.entries(Sheets)) {
        const [grid_start, grid_end] = sheet_raw_data['!ref'].split(':');
        const start_match = grid_start.match(/([A-Z]+)(\d+)/);
        const end_match = grid_end.match(/([A-Z]+)(\d+)/);
        const column_arr = getXArr(start_match[1], end_match[1]);
        const row_arr = getYArr(Number(start_match[2]), Number(end_match[2]));

        const sheet_data = [];
        for (const [x, item_x] of row_arr.entries()) {
            const item_row = [];
            for (const [j, item_y] of column_arr.entries()) {
                const raw_item = sheet_raw_data[item_y + item_x];
                const item_data = parseItem(raw_item);
                item_row.push(item_data);
            }
            sheet_data.push(item_row);
        }
        /** 删除后排空元素 */
        for (let len = sheet_data.length, i = len - 1; i >= 0; i--) {
            const item_row = sheet_data[i];
            for (let len2 = item_row.length, j = len2 - 1; j >= 0; j--) {
                const item = item_row[j];
                if (!item && j === item_row.length - 1) {
                    item_row.splice(j, 1);
                }
            }
            if (item_row.length === 0 && i === sheet_data.length - 1) {
                sheet_data.splice(i, 1);
            }
        }
        result.push(sheet_data);
    }
    return result;
}

function parseItem(raw_data: any) {
    if (!raw_data) {
        return;
    }
    const { v } = raw_data;
    let { c } = raw_data;
    if (c) {
        /** 只记录第一个comment */
        c = c.map(item => {
            return item.t;
        })[0];
    }

    return {
        v,
        c,
    };
}

export function getXArr(start: string, end: string) {
    // prettier-ignore
    // tslint:disable-next-line:max-line-length
    const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const result = [];
    let cur_prefix = '';
    let round = 0;
    let is_start = false;
    let is_end = false;
    while (true) {
        for (const key of keys) {
            const cur_key = cur_prefix + key;
            if (cur_key === start) {
                is_start = true;
            }
            if (is_start) {
                result.push(cur_key);
            }
            if (cur_key === end) {
                is_end = true;
                break;
            }
        }
        if (is_end) {
            break;
        }
        cur_prefix = keys[round];
        round++;
    }

    return result;
}
export function getYArr(start: number, end: number) {
    // prettier-ignore
    // tslint:disable-next-line:max-line-length
    const result = [];

    for (let i = start; i <= end; i++) {
        result.push(i);
    }
    return result;
}
