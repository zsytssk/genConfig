import * as path from 'path';
import { DIST, intConfig } from './const';
import { genXlsx } from './gen/gen';
import { cp } from './ls/main';
import { rm } from './ls/rm';
import { state } from './state';
import { walkSrc } from './utils/walkSrc';

const type = process.argv.slice(2)[0];
const config_path = path.resolve(path.dirname(process.argv[1]), './config.json');

async function gen() {
    await rm(DIST);
    const files_arr = await walkSrc();
    for (const file of files_arr) {
        await genXlsx(file);
    }
    console.log(state.error_arr);
}

export async function releaseExtern() {
    const src = 'D:\\zsytssk\\job\\legend\\genConfig';
    const dist = 'D:\\zsytssk\\job\\legend\\legend_demo\\script\\genConfig';
    const files = ['config.json'];
    for (const file of files) {
        cp(path.resolve(src, file), path.resolve(dist, file));
    }
}

async function main() {
    await intConfig(config_path);
    const actions = {
        gen,
    };
    if (actions[type]) {
        await actions[type]();
    }
}
main();
