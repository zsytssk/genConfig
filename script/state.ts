export const state = {} as {
    file_name: string;
    item_title: string;
    error_arr: string[];
};
export function addErr(msg: string) {
    if (!state.error_arr) {
        state.error_arr = [];
    }
    if (state.error_arr.indexOf(msg) === -1) {
        state.error_arr.push(msg);
    }
}
