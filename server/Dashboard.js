import { ModulesSchema } from "../db/models/pragma_modules/index";
const log = require('log4js').getLogger('dashboard');
export class Dashboard {
    static get code() {
        return Dashboard._code;
    }
    static get id() {
        return Dashboard._id;
    }
    static get freePeriodDays() {
        return Dashboard._free_period_days;
    }
    static async init() {
        await Dashboard._loadData();
    }
    static async _loadData() {
        try {
            await Dashboard._getData();
        }
        catch (e) {
            log.error("Can not get Dashboard data. " + e.stack);
        }
    }
    static async _getData() {
        let res = await ModulesSchema.findOne({
            where: { code: Dashboard.code },
            raw: true
        });
        let message = res ? 'Dashboard init' : 'Can not get dashboard data';
        console.log(message);
        Dashboard._id = res.id;
        Dashboard._free_period_days = res.free_period_days;
    }
}
Dashboard._code = 'Dashboard';
//# sourceMappingURL=Dashboard.js.map