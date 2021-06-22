import { Router } from "../../MainRouterHandler";
import { IServer } from "../../IServer";
var Response = IServer.Response;
import { IValidator } from "../../validator/Validator";
var Validator = IValidator.Validator;
var Errors = IServer.Errors;
import { EmployeesExecutor } from "./EmployeesExecutor";
const log = require('log4js').getLogger('employees');
export class EmployeesRouter extends Router {
    static async execute(request) {
        try {
            return await EmployeesRouter._execute(request);
        }
        catch (e) {
            const error = IServer.Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new EmployeesRouter(request);
        return await executor.run();
    }
    async run() {
        switch (super.url.method) {
            case 'get.all':
                return this.getHandler();
            case 'owner':
                return this.getOwnerHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    get data() {
        return this.request.query.data;
    }
    async getHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const result = await EmployeesExecutor.self.getAll(account_id);
        return new Response(result);
    }
    async getOwnerHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const result = await EmployeesExecutor.self.getOwner(account_id);
        return new Response(result);
    }
}
EmployeesRouter.handler = async (req, res) => {
    let response = await EmployeesRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=EmployeesRouter.js.map