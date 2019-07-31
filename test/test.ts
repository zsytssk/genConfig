import { convertXlsxVal } from './convertXlsxVal';

export function test() {
    // let val = convertXlsxVal('1', 'number');
    // console.log(val);

    let val = convertXlsxVal('1001,100', ['string', 'number']);
    console.log(val);
}
test();
