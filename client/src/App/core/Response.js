import store from '../../store/index';
export class Response {
    static handler(res) {
        var _a;
        if (!res)
            return true;
        if ('error' in ((_a = res.data) === null || _a === void 0 ? void 0 : _a.result)) {
            store.commit('set_toast', { type: 'error', message: res.data.result.message });
            return false;
        }
        return res.data.result;
    }
}
//# sourceMappingURL=Response.js.map