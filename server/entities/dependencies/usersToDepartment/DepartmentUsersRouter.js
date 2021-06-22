import { Router } from "../../../MainRouterHandler";
import { IServer } from "../../../IServer";
var Errors = IServer.Errors;
import { IValidator } from "../../../validator/Validator";
var Validator = IValidator.Validator;
var Response = IServer.Response;
import { BDepartmentUsersFabric } from "./BDepartmentUsersFabric";
const log = require('log4js').getLogger('users_to_department');
export class DepartmentToUsersRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await DepartmentToUsersRouter._execute(request);
        }
        catch (e) {
            const error = Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new DepartmentToUsersRouter(request);
        return await executor.run();
    }
    async run() {
        switch (super.url.method) {
            case 'get':
                return this.getHandler();
            case 'add':
                return this.addUsersHandler();
            case 'delete':
                return await this.deleteUsersHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    get data() {
        return this.request.query.data;
    }
    async getHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const result = await BDepartmentUsersFabric.self.getAll(account_id);
        return new Response(result);
    }
    async addUsersHandler() {
        let validData = this.validChangesData();
        const result = await BDepartmentUsersFabric.self.createLinks(validData);
        return new Response(result);
    }
    async deleteUsersHandler() {
        let validData = this.validChangesData();
        const result = await BDepartmentUsersFabric.self.destroyLinks(validData);
        return new Response(result);
    }
    validChangesData() {
        return this.data.map((item) => {
            return {
                department_id: Validator.toId(item.department_id),
                employees_id: Validator.toIds(item.employees_id)
            };
        });
    }
}
DepartmentToUsersRouter.handler = async (req, res) => {
    let response = await DepartmentToUsersRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=DepartmentUsersRouter.js.map