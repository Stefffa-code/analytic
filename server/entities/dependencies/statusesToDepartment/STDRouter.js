import { Router } from "../../../MainRouterHandler";
import { IServer } from "../../../IServer";
var Errors = IServer.Errors;
import { IValidator } from "../../../validator/Validator";
var Validator = IValidator.Validator;
var Response = IServer.Response;
import { BStatusesToDepartmentFabric } from "./STDFabric";
const log = require('log4js').getLogger('statuses_to_department');
export class StatusesToDepartmentRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await StatusesToDepartmentRouter._execute(request);
        }
        catch (e) {
            const error = Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new StatusesToDepartmentRouter(request);
        return await executor.run();
    }
    async run() {
        switch (super.url.method) {
            case 'get':
                return this.getHandler();
            case 'add':
                return this.addStatusesHandler();
            case 'delete':
                return await this.deleteStatusesHandler();
            case 'update.name':
                return await this.updateItemsNameHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    get data() {
        return this.request.query.data;
    }
    async getHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const result = await BStatusesToDepartmentFabric.self.getAll(account_id);
        return new Response(result);
    }
    async addStatusesHandler() {
        let validData = this.validChanges();
        const result = await BStatusesToDepartmentFabric.self.createDepartmentsLinks(validData);
        return new Response(result);
    }
    async deleteStatusesHandler() {
        let validData = this.validChanges();
        const result = await BStatusesToDepartmentFabric.self.deleteStatuses(validData);
        return new Response(result);
    }
    async updateItemsNameHandler() {
        let validData = this.validItems();
        const result = await BStatusesToDepartmentFabric.self.updateItemsName(validData);
        return new Response(result);
    }
    validChanges() {
        return {
            account_id: Validator.toId(this.data.account_id),
            structs: this._validateChangesData(this.data.structs)
        };
    }
    validItems() {
        return {
            account_id: Validator.toId(this.data.account_id),
            structs: this._validateItemSTD(this.data.structs)
        };
    }
    _validateChangesData(data) {
        return data.map((item) => {
            return {
                department_id: Validator.toId(item.department_id),
                statuses_id: Validator.toIds(item.statuses_id)
            };
        });
    }
    _validateItemSTD(data) {
        return data.map((item) => {
            return {
                department_id: Validator.toId(item.department_id),
                status_id: Validator.toId(item.status_id),
                name: Validator.toTitleOrNull(item.name)
            };
        });
    }
}
StatusesToDepartmentRouter.handler = async (req, res) => {
    let response = await StatusesToDepartmentRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=STDRouter.js.map