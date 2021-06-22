import { BSegmentsFabric } from "./SegmentsFabric";
const log = require('log4js').getLogger('segments');
import { Router } from "../../../MainRouterHandler";
import { IServer } from "../../../IServer";
var Errors = IServer.Errors;
var Response = IServer.Response;
import { IValidator } from "../../../validator/Validator";
var Validator = IValidator.Validator;
export class SegmentsRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await SegmentsRouter._execute(request);
        }
        catch (e) {
            const error = IServer.Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new SegmentsRouter(request);
        return await executor.run();
    }
    get data() {
        return this.request.query.data;
    }
    async run() {
        switch (super.url.method) {
            case 'get':
                return this.getHandler();
            case 'create':
                return this.createHandler();
            case 'update':
                return this.updateHandler();
            case 'delete':
                return this.deleteHandler();
            case 'pipelines.add':
                return this.addPipelinesHandler();
            case 'pipelines.delete':
                return this.deletePipelinesHandler();
            case 'check.segments':
                return this.checkCorrectSegmentsHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    async getHandler() {
        let account_id = Validator.toId(this.data.account_id);
        const response = await BSegmentsFabric.self.get(account_id);
        return new Response(response);
    }
    async createHandler() {
        let validData = this.validateCreateData();
        const response = await BSegmentsFabric.self.createSegments(validData);
        return new Response(response);
    }
    async updateHandler() {
        let validData = this.validateItemData();
        const response = await BSegmentsFabric.self.updateSegment(validData);
        return new Response(response);
    }
    async deleteHandler() {
        let validData = Validator.toIds(this.data);
        const response = await BSegmentsFabric.self.deleteSegments(validData);
        return new Response(response);
    }
    async addPipelinesHandler() {
        let validData = this.validateLink();
        const response = await BSegmentsFabric.self.addPipelinesToSegment(validData);
        return new Response(response);
    }
    async deletePipelinesHandler() {
        let validData = this.validateLink();
        const response = await BSegmentsFabric.self.deletePipelinesFromSegment(validData);
        return new Response(response);
    }
    async checkCorrectSegmentsHandler() {
        let validData = Validator.toIds(this.data);
        const response = await BSegmentsFabric.self.checkCorrectSegments(validData);
        return new Response(response);
    }
    validateCreateData() {
        return this.data.map((item) => {
            return {
                name: Validator.isTitle(item.name),
                sort: Validator.toNumber(item.sort),
                account_id: Validator.toId(item.account_id)
            };
        });
    }
    validateItemData() {
        return this.data.map((item) => {
            return {
                id: Validator.toId(item.id),
                name: Validator.isTitle(item.name),
                sort: Validator.toNumber(item.sort),
                account_id: Validator.toId(item.account_id),
                multiple: Validator.toBoolean(item.multiple)
            };
        });
    }
    validateItemLink() {
        return this.data.map((item) => {
            return {
                segment_id: Validator.toId(item.segment_id),
                pipeline_id: Validator.toId(item.pipeline_id)
            };
        });
    }
    validateLink() {
        return this.data.map((item) => {
            return {
                segment_id: Validator.toId(item.segment_id),
                pipelines_id: Validator.toIds(item.pipelines_id)
            };
        });
    }
}
SegmentsRouter.handler = async (req, res) => {
    let response = await SegmentsRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=SegmentsRouter.js.map