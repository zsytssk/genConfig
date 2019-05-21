import * as nodeXlsx from 'node-xlsx';
import * as path from 'path';
import { PROJECT_FOLDER } from '../const';
import { write } from '../ls/write';
import { stringify } from '../utils/util';
import { calcType, convertType, ItemType } from './type';

// import * as xlsx from 'xlsx';
type XlsxInfo = {
    info: {
        title: string[];
        zh_title: string[];
        type: ItemType[];
    };
    data: {
        [key: string]: any;
    };
};
export const state = {} as {
    file_name: string;
    item_title: string;
};
export async function genXlsx(file: string) {
    const result = { data: {}, info: {} } as XlsxInfo;
    const file_name = fileName(file);

    state.file_name = file_name;
    const xlsx_content = nodeXlsx.parse(file);
    const [title, type_str_arr, zh_title, ...data] = xlsx_content[0].data;
    const type_arr = calcType(type_str_arr);
    result.info = {
        title,
        type: type_str_arr,
        zh_title,
    };
    for (let i = 0; i < type_arr.length; i++) {
        const item_type = type_arr[i];
        const item_title = title[i];
        state.item_title = item_title;

        if (item_type === undefined) {
            console.error(`${file_name}:>${item_title}:> type === ${item_type}`);
        }
    }

    const is_arr = detectIsArr(data);
    for (const row of data) {
        const item_info = {};
        if (row.length === 0) {
            continue;
        }
        for (let k = 0; k < title.length; k++) {
            const item_type = type_arr[k];
            const item_title = title[k];
            item_info[item_title] = convertType(row[k], item_type);
        }
        if (!is_arr) {
            result.data[row[0]] = item_info;
            continue;
        }
        /** 如果是数组就 push到 Array 中... */
        if (!result.data[row[0]]) {
            result.data[row[0]] = [];
        }
        result.data[row[0]].push(item_info);
    }
    const laya_map_folder = path.resolve(PROJECT_FOLDER, 'laya/assets/config');
    const bin_map_folder = path.resolve(PROJECT_FOLDER, 'bin/config');

    const dist1_path = path.resolve(laya_map_folder, `${file_name}.json`);
    const dist2_path = path.resolve(bin_map_folder, `${file_name}.json`);

    await write(dist1_path, stringify(result, 2));
    await write(dist2_path, stringify(result, 2));
}

export function fileName(file_path: string) {
    const extension = path.extname(file_path);
    return path.basename(file_path, extension);
}
/** 存在item的第一个值相同 就是数组 */
function detectIsArr(data: any[]) {
    for (let i = 0; i < data.length; i++) {
        const cur_item = data[i];
        const index = data.findIndex(item => {
            return item[0] !== undefined && item[0] === cur_item[0];
        });
        if (index !== -1 && index !== i) {
            return true;
        }
    }
    return false;
}
