import {ICommonStatuses} from "./ICommonStatuses";

const log = require('log4js').getLogger('segments');
import {Router} from "../../../MainRouterHandler";
import {IServer} from "../../../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import Response = IServer.Response;
import ICreateStage = ICommonStatuses.ICreateStage;
import {IValidator} from "../../../validator/Validator";
import Validator = IValidator.Validator;
import IItemStage = ICommonStatuses.IItemStage;
import ILinkItemStatuses = ICommonStatuses.ILinkItemStatuses;
import ILinkStatuses = ICommonStatuses.ILinkStatuses;
import {BStagesFabric} from "./StatusesFabric";




export  class StagesRouter extends Router {
    constructor(request: IRequest) {
        super(request)
    }

    static handler = async (req: any, res: any): Promise<void> => {
        let response = await StagesRouter.execute(req)
        if (response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse> {
        try {
            return await StagesRouter._execute(request)
        } catch (e) {
            const error = IServer.Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse> {
        const executor = new StagesRouter(request)
        return await executor.run()
    }

    private get data(): any {
        return this.request.query.data
    }


    async run(): Promise<IServer.Response> {
        switch (super.url.method) {

            case 'get':
                return this.getHandler()
            case 'get.closed':
                return this.closedStatusesHandler()
            case 'get.in.pipelines':
                return this.getInPipelinesHandler()
            case 'create':
                return this.createHandler()
            case 'update':
                return this.updateHandler()
            case 'delete':
                return this.deleteHandler()
            case 'statuses.add':
                return await this.addStatusesHandler()
            case 'statuses.delete':
                return this.deleteStatusesHandler()
            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private async getHandler(): Promise<Response> {
        let account_id = Validator.toId(this.data.account_id)
        const response = await BStagesFabric.self.get(account_id)
        return new Response(response)
    }
    private async closedStatusesHandler(): Promise<Response> {
        const response = await BStagesFabric.self.getClosed()
        return new Response(response)
    }

    private async getInPipelinesHandler(): Promise<Response> {
        let pipelines_id = Validator.toIds(this.data.pipelines_id)
        const response = await BStagesFabric.self.getInPipelines(pipelines_id)
        return new Response(response)
    }

    private async createHandler(): Promise<Response> {
        let validData = this.validateCreateData()
        const response = await BStagesFabric.self.create(validData)
        return new Response(response)
    }

    private async updateHandler(): Promise<Response> {
        let validData = this.validateItem()
        const response = await BStagesFabric.self.update(validData)
        return new Response(response)
    }

    private async deleteHandler(): Promise<Response> {
        let validData = this.validateDeleteData()
        const response = await BStagesFabric.self.deleteStages(validData)
        return new Response(response)
    }

    private async addStatusesHandler(): Promise<Response> {
        let validData = this.validateLink()
        const response = await BStagesFabric.self.addLinksStatusesToStage(validData)
        return new Response(response)
    }

    private async deleteStatusesHandler(): Promise<Response> {
        let validData = this.validateLink()
        const response = await BStagesFabric.self.deleteLinksStatusesToStage(validData)
        return new Response(response)
    }

    private validateCreateData(): ICreateStage[] {
        return this.data.map((item: any) => {
            return {
                pipeline_id: Validator.toId(item.pipeline_id),
                name: Validator.isTitle(item.name),
                color: Validator.isColor(item.color),
                sort: Validator.toNumber(item.sort),
            }
        })
    }

    private validateItem(): IItemStage[] {
        return this.data.map((item: any) => {
            return {
                name: Validator.isTitle(item.name),
                color: Validator.isColor(item.color),
                sort: Validator.toNumber(item.sort),
                id: Validator.toId(item.id),
                multiple: Validator.toBoolean(item.multiple),
            }
        })
    }

    private validateItemLink(): ILinkItemStatuses[] {
        return this.data.map((item: any) => {
            return {
                segment_id: Validator.toId(item.segment_id),
                stage_id: Validator.toId(item.stage_id),
                status_id: Validator.toId(item.status_id)
            }
        })
    }

    private validateLink(): ILinkStatuses[] {
        return this.data.map((item: any) => {
            return {
                segment_id: Validator.toId(item.segment_id),
                stage_id: Validator.toId(item.stage_id),
                statuses_id: Validator.toIds(item.statuses_id)
            }
        })
    }

    private validateDeleteData(): number[] {
        return Validator.toIds(this.data)
    }
}