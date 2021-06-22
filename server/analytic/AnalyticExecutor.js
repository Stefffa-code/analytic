const zlib = require('zlib');
const log = require('log4js').getLogger('metrics ');
const { Op, fn, col, literal, query, QueryTypes } = require('sequelize');
export class AnalyticExecutor {
    static get self() {
        if (AnalyticExecutor.inst)
            return AnalyticExecutor.inst;
        AnalyticExecutor.inst = new AnalyticExecutor();
        return AnalyticExecutor.inst;
    }
    async toGzipData(data) {
        let stringData = JSON.stringify(data);
        await zlib.gzip(stringData, (err, buffer) => {
            if (err) {
                log.error(err.stack);
            }
        });
        return stringData;
    }
    async loadAll(account_id) {
    }
    async loadSliceFrom(data) {
    }
}
//# sourceMappingURL=AnalyticExecutor.js.map