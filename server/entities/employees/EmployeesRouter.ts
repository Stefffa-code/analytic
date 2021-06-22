import {Router} from "../../MainRouterHandler";
import {IServer} from "../../IServer";
import IRequest = IServer.IRequest;
import Response = IServer.Response;
import {IValidator} from "../../validator/Validator";
import Validator = IValidator.Validator;
import Errors = IServer.Errors;
import {EmployeesExecutor} from "./EmployeesExecutor";
const log = require('log4js').getLogger('employees');




export class EmployeesRouter extends  Router{
    static handler = async(req: any, res: any): Promise<void> => {
        let response = await EmployeesRouter.execute(req)
        if(response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse>{
        try {
            return await EmployeesRouter._execute(request)
        } catch(e) {
            const error = IServer.Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse>{
        const executor = new EmployeesRouter(request)
        return await executor.run()
    }


    async run(): Promise<IServer.Response> {
        switch(super.url.method) {
            case 'get.all':
                return this.getHandler()
            case 'owner':
                return this.getOwnerHandler()
            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private get data(): any {
        return this.request.query.data
    }

    private async getHandler(): Promise<Response> {
        let account_id: number = Validator.toId(this.data.account_id)
        const result = await  EmployeesExecutor.self.getAll(account_id)
        return new Response(result)
    }

    private async getOwnerHandler(): Promise<Response> {
        let account_id: number = Validator.toId(this.data.account_id)
        const result = await  EmployeesExecutor.self.getOwner(account_id)
        return new Response(result)
    }


}