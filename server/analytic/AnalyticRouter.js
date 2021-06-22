import { Router } from "../MainRouterHandler";
import { IServer } from "../IServer";
var Errors = IServer.Errors;
var Response = IServer.Response;
import { IValidator } from "../validator/Validator";
var Validator = IValidator.Validator;
import { AnalyticExecutor } from "./AnalyticExecutor";
const log = require('log4js').getLogger('analytic_old');
export class AnalyticRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await AnalyticRouter._execute(request);
        }
        catch (e) {
            const error = IServer.Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new AnalyticRouter(request);
        return await executor.run();
    }
    async run() {
        switch (super.url.method) {
            case 'all':
                return this.getAllHandler();
            case 'from':
                return this.getSliceFromHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    get data() {
        return this.request.query.data;
    }
    async getAllHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const result = await AnalyticExecutor.self.loadAll(account_id);
        return new Response(result);
    }
    async getSliceFromHandler() {
        let data = this.validateSliceData(this.data);
        const result = await AnalyticExecutor.self.loadSliceFrom(data);
        return new Response(result);
    }
    validateSliceData(data) {
        return {
            account_id: Validator.toId(data.account_id),
            start: Validator.toDayInSec(data.start),
        };
    }
}
AnalyticRouter.handler = async (req, res) => {
    let response = await AnalyticRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=AnalyticRouter.js.map