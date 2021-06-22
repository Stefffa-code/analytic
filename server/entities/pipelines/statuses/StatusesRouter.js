const log = require('log4js').getLogger('segments');
import { Router } from "../../../MainRouterHandler";
import { IServer } from "../../../IServer";
var Errors = IServer.Errors;
var Response = IServer.Response;
import { IValidator } from "../../../validator/Validator";
var Validator = IValidator.Validator;
import { BStagesFabric } from "./StatusesFabric";
export class StagesRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await StagesRouter._execute(request);
        }
        catch (e) {
            const error = IServer.Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new StagesRouter(request);
        return await executor.run();
    }
    get data() {
        return this.request.query.data;
    }
    async run() {
        switch (super.url.method) {
            case 'get':
                return this.getHandler();
            case 'get.closed':
                return this.closedStatusesHandler();
            case 'get.in.pipelines':
                return this.getInPipelinesHandler();
            case 'create':
                return this.createHandler();
            case 'update':
                return this.updateHandler();
            case 'delete':
                return this.deleteHandler();
            case 'statuses.add':
                return await this.addStatusesHandler();
            case 'statuses.delete':
                return this.deleteStatusesHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    async getHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const response = await BStagesFabric.self.get(account_id);
        return new Response(response);
    }
    async closedStatusesHandler() {
        const response = await BStagesFabric.self.getClosed();
        return new Response(response);
    }
    async getInPipelinesHandler() {
        let pipelines_id = Validator.toIds(this.data.pipelines_id);
        const response = await BStagesFabric.self.getInPipelines(pipelines_id);
        return new Response(response);
    }
    async createHandler() {
        let validData = this.validateCreateData();
        const response = await BStagesFabric.self.create(validData);
        return new Response(response);
    }
    async updateHandler() {
        let validData = this.validateItem();
        const response = await BStagesFabric.self.update(validData);
        return new Response(response);
    }
    async deleteHandler() {
        let validData = this.validateDeleteData();
        const response = await BStagesFabric.self.deleteStages(validData);
        return new Response(response);
    }
    async addStatusesHandler() {
        let validData = this.validateLink();
        const response = await BStagesFabric.self.addLinksStatusesToStage(validData);
        return new Response(response);
    }
    async deleteStatusesHandler() {
        let validData = this.validateLink();
        const response = await BStagesFabric.self.deleteLinksStatusesToStage(validData);
        return new Response(response);
    }
    validateCreateData() {
        return this.data.map((item) => {
            return {
                pipeline_id: Validator.toId(item.pipeline_id),
                name: Validator.isTitle(item.name),
                color: Validator.isColor(item.color),
                sort: Validator.toNumber(item.sort),
            };
        });
    }
    validateItem() {
        return this.data.map((item) => {
            return {
                name: Validator.isTitle(item.name),
                color: Validator.isColor(item.color),
                sort: Validator.toNumber(item.sort),
                id: Validator.toId(item.id),
                multiple: Validator.toBoolean(item.multiple),
            };
        });
    }
    validateItemLink() {
        return this.data.map((item) => {
            return {
                segment_id: Validator.toId(item.segment_id),
                stage_id: Validator.toId(item.stage_id),
                status_id: Validator.toId(item.status_id)
            };
        });
    }
    validateLink() {
        return this.data.map((item) => {
            return {
                segment_id: Validator.toId(item.segment_id),
                stage_id: Validator.toId(item.stage_id),
                statuses_id: Validator.toIds(item.statuses_id)
            };
        });
    }
    validateDeleteData() {
        return Validator.toIds(this.data);
    }
}
StagesRouter.handler = async (req, res) => {
    let response = await StagesRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=StatusesRouter.js.map