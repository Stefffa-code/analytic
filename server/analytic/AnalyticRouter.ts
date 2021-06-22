import {Router} from "../MainRouterHandler";
import {IServer} from "../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import Response = IServer.Response;
import {IValidator} from "../validator/Validator";
import Validator = IValidator.Validator;
import {AnalyticExecutor} from "./AnalyticExecutor";
import {AnalyticTypes} from "./AnalyticTypes";
import ISliceQuery = AnalyticTypes.ISliceQuery;
const log = require('log4js').getLogger('analytic_old');




export  class AnalyticRouter extends Router {
    constructor(request: IRequest) {
        super(request)
    }

    static handler = async (req: any, res: any): Promise<void> => {
        let response = await AnalyticRouter.execute(req)
        if (response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse> {
        try {
            return await AnalyticRouter._execute(request)
        } catch (e) {
            const error = IServer.Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse> {
        const executor = new AnalyticRouter(request)
        return await executor.run()
    }


    async run(): Promise<IServer.Response> {
        switch (super.url.method) {
            case 'all':
                return this.getAllHandler()
            case 'from':
                return this.getSliceFromHandler()
            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private get data(): any {
        return this.request.query.data
    }

    private async getAllHandler(): Promise<Response> {
        let account_id: number = Validator.toId(this.data.account_id)
        const result = await AnalyticExecutor.self.loadAll(account_id)
        return new Response(result)
    }

    private async getSliceFromHandler(): Promise<Response> {
        let data = this.validateSliceData(this.data)
        const result = await AnalyticExecutor.self.loadSliceFrom(data)
        return new Response(result)
    }

    private validateSliceData(data: any):ISliceQuery{
        return{
            account_id: Validator.toId(data.account_id),
            start: Validator.toDayInSec(data.start),
        }
    }
}