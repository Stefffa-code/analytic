import {BSegmentsFabric} from "./SegmentsFabric";

const log = require('log4js').getLogger('segments');
import {Router} from "../../../MainRouterHandler";
import {IServer} from "../../../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import Response = IServer.Response;
import {IValidator} from "../../../validator/Validator";
import Validator = IValidator.Validator;
import {ICommonPipeline} from "./ICommonSegments";
import ICreateSegment = ICommonPipeline.ICreateSegment;
import IItemSegment = ICommonPipeline.IItemPipeline;
import ILinkSegmentToPipeline = ICommonPipeline.ILinkSegmentToPipeline;
import ILinkItemSegment = ICommonPipeline.ILinkItemSegment;



export  class SegmentsRouter extends Router {
    constructor(request: IRequest ) {
        super(request)
    }

    static handler = async(req: any, res: any): Promise<void> => {
        let response = await SegmentsRouter.execute(req)
        if(response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse>{
        try {
            return await SegmentsRouter._execute(request)
        } catch(e) {
            const error = IServer.Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse>{
        const executor = new SegmentsRouter(request)
        return await executor.run()
    }

    private get data(): any {
        return this.request.query.data
    }

    async run(): Promise<IServer.Response> {
        switch(super.url.method) {
            case 'get':
                return this.getHandler()
            case 'create':
                return this.createHandler()
            case 'update':
                return this.updateHandler()
            case 'delete':
                return this.deleteHandler()
            case 'pipelines.add':
                return this.addPipelinesHandler()
            case 'pipelines.delete':
                return this.deletePipelinesHandler()
            case 'check.segments':
                return this.checkCorrectSegmentsHandler()
            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private async getHandler(): Promise<Response> {
        let account_id: number = Validator.toId(this.data.account_id)
        const response = await BSegmentsFabric.self.get(account_id)
        return new Response(response)
    }

    private async createHandler(): Promise<Response> {
        let validData = this.validateCreateData()
        const response = await BSegmentsFabric.self.createSegments(validData)
        return new Response(response)
    }

    private async updateHandler(): Promise<Response> {
        let validData = this.validateItemData()
        const response = await BSegmentsFabric.self.updateSegment(validData)
        return new Response(response)
    }

    private async deleteHandler(): Promise<Response> {
        let validData = Validator.toIds(this.data )
        const response = await BSegmentsFabric.self.deleteSegments(validData)
        return new Response(response)
    }

    private async addPipelinesHandler(): Promise<Response> {
        let validData = this.validateLink()
        const response = await BSegmentsFabric.self.addPipelinesToSegment(validData)
        return new Response(response)
    }

    private async deletePipelinesHandler(): Promise<Response> {
        let validData = this.validateLink()
        const response = await BSegmentsFabric.self.deletePipelinesFromSegment(validData)
        return new Response(response)
    }

    private async checkCorrectSegmentsHandler(): Promise<Response> {
        let validData = Validator.toIds(this.data )
        const response = await BSegmentsFabric.self.checkCorrectSegments(validData)
        return new Response(response)
    }



    private validateCreateData(): ICreateSegment[]{
        return this.data.map((item:any) => {
            return {
                name:  Validator.isTitle(item.name ),
                sort: Validator.toNumber(item.sort),
                account_id: Validator.toId(item.account_id)
            }
        })
    }

    private validateItemData(): IItemSegment[]{
        return this.data.map((item:any) => {
            return {
                id: Validator.toId(item.id),
                name:  Validator.isTitle(item.name ),
                sort: Validator.toNumber(item.sort),
                account_id: Validator.toId(item.account_id),
                multiple: Validator.toBoolean(item.multiple)
            }
        })
    }

    private validateItemLink(): ILinkItemSegment[]{
        return this.data.map( (item:any) => {
            return {
                segment_id: Validator.toId(item.segment_id ),
                pipeline_id: Validator.toId(item.pipeline_id)
            }
        })
    }

    private validateLink( ): ILinkSegmentToPipeline[]{
        return this.data.map((item:any) => {
            return {
                segment_id: Validator.toId(item.segment_id ),
                pipelines_id: Validator.toIds(item.pipelines_id)
            }
        })
    }

}