import { Router } from "../../MainRouterHandler";
import { IServer } from "../../IServer";
var Errors = IServer.Errors;
import { IBDepartmentsFabric } from "./DepartmentsFabric";
var Response = IServer.Response;
var BDepartmentsFabric = IBDepartmentsFabric.BDepartmentsFabric;
import { IValidator } from "../../validator/Validator";
var Validator = IValidator.Validator;
const log = require('log4js').getLogger('departments');
export class DepartmentsRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await DepartmentsRouter._execute(request);
        }
        catch (e) {
            const error = IServer.Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new DepartmentsRouter(request);
        return await executor.run();
    }
    async run() {
        switch (super.url.method) {
            case 'get':
                return this.getHandler();
            case 'create':
                return await this.createHandler();
            case 'update':
                return await this.updateHandler();
            case 'delete':
                return await this.deleteHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    get data() {
        return this.request.query.data;
    }
    async getHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const result = await BDepartmentsFabric.self.getAll(account_id);
        return new Response(result);
    }
    async createHandler() {
        let validData = this.validateCreateData(this.data);
        const result = await BDepartmentsFabric.self.create(validData);
        return new Response(result);
    }
    async updateHandler() {
        let validData = this.validUpdateData(this.data);
        const result = await BDepartmentsFabric.self.update(validData);
        return new Response(result);
    }
    async deleteHandler() {
        const result = await BDepartmentsFabric.self.remove(this.data);
        return new Response(result);
    }
    validateCreateData(data) {
        return data.map(item => {
            return {
                title: Validator.isTitle(item.title),
                account_id: Validator.toId(item.account_id)
            };
        });
    }
    validUpdateData(data) {
        return data.map(item => {
            return {
                title: Validator.isTitle(item.title),
                account_id: Validator.toId(item.account_id),
                id: Validator.toId(item.id),
                head_id: Validator.toIdOrNull(item.head_id),
                parent_department_id: Validator.toIdOrNull(item.parent_department_id)
            };
        });
    }
    validDepartData(data) {
        return data.map(item => {
            return {
                title: Validator.isTitle(item.title),
                account_id: Validator.toId(item.account_id),
                id: Validator.toId(item.id),
                employees_id: Validator.toIds(item.employees_id),
                head_id: Validator.toIdOrNull(item.head_id),
                parent_department_id: Validator.toIdOrNull(item.parent_department_id)
            };
        });
    }
}
DepartmentsRouter.handler = async (req, res) => {
    let response = await DepartmentsRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=DepartmentsRouter.js.map