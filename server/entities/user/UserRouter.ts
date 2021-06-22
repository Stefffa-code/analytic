import {Router} from "../../MainRouterHandler";
import {IServer} from "../../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import Response = IServer.Response;
import {IValidator} from "../../validator/Validator";
import Validator = IValidator.Validator;
import {UserExecutor} from "./UserExecutor";
const log = require('log4js').getLogger('user');


export class UserRouter extends Router{
    constructor(request: IRequest ) {
        super(request)
    }

    static handler = async(req: any, res: any): Promise<void> => {
        let response = await UserRouter.execute(req)
        if(response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse>{
        try {
            return await UserRouter._execute(request)
        } catch(e) {
            const error = IServer.Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse>{
        const executor = new UserRouter(request)
        return await executor.run()
    }

    async run(): Promise<IServer.Response> {
        switch(super.url.method) {
            case 'get.partially.hidden.login':
                return this.getPartiallyHiddenLoginHandler()

            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private get data(): any {
        return this.request.query.data
    }

    private async getPartiallyHiddenLoginHandler(): Promise<Response> {
        let user_id: number = Validator.toId(this.data.user_id)
        const result = await UserExecutor.self.getPartiallyHiddenLogin(user_id)
        return new Response(result)
    }


}