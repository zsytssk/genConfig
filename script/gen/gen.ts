import * as path from 'path';
import { PROJECT_FOLDER } from '../const';
import { getFileInfo } from '../ls/pathUtil';
import { write } from '../ls/write';
import { stringify } from '../utils/util';
import { calcItemType, calcType, convertType, ItemType } from './type';
import { parseXlsx } from './xlsxUtil';

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
    const file_info = await getFileInfo(file);
    if (file_info.type === 'directory') {
        return;
    }
    const result = { data: {}, info: {} } as XlsxInfo;
    const file_name = fileName(file);

    state.file_name = file_name;

    let xlsx_content;
    try {
        xlsx_content = parseXlsx(file);
    } catch {
        return;
    }
    const [title_raw, type_str_arr_raw, zh_title_raw, ...data_raw] = xlsx_content[0];

    const title = title_raw.map(item => {
        return item.v;
    });
    const zh_title = zh_title_raw.map(item => {
        return item.v;
    });
    const type_str_arr = type_str_arr_raw.map(item => {
        return item.v;
    }) as ItemType[];
    const type = calcType(
        type_str_arr_raw.map(item => {
            return item.v;
        }),
    );
    result.info = {
        title,
        type: type_str_arr,
        zh_title,
    };
    for (let len = type.length, i = len - 1; i >= 0; i--) {
        const item_type = type[i];
        const item_title = title[i];
        state.item_title = item_title;

        if (item_type === undefined) {
            if (i === type.length - 1 && !item_title) {
                delete type[i];
                break;
            }
            console.error(`${file_name}:>${item_title}:> type === ${item_type}`);
        }
    }

    const is_arr = detectIsArr(data_raw);
    for (const row of data_raw) {
        const item_info = {};
        if (row.length === 0) {
            continue;
        }
        const key = row[0].v;
        for (let k = 0; k < title.length; k++) {
            let item_type = type[k];
            const item_title = title[k];
            const { v, c } = row[k] || ({} as any);
            if (c) {
                item_type = calcItemType(c);
            }
            item_info[item_title] = convertType(v, item_type);
        }
        if (!is_arr) {
            result.data[key] = item_info;
            continue;
        }
        /** 如果是数组就 push到 Array 中... */
        if (!result.data[key]) {
            result.data[key] = [];
        }
        result.data[key].push(item_info);
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
/** 存在key重复的相同元素, 将他们放到数组中数组 */
function detectIsArr(data: any[]) {
    for (let i = 0; i < data.length; i++) {
        const cur_item = data[i];
        const index = data.findIndex(item => {
            return item[0].v !== undefined && item[0].v === cur_item[0].v;
        });
        if (index !== -1 && index !== i) {
            return true;
        }
    }
    return false;
}
