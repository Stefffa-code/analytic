import { Router } from "../../MainRouterHandler";
import { IServer } from "../../IServer";
var Errors = IServer.Errors;
var Response = IServer.Response;
import { IValidator } from "../../validator/Validator";
var Validator = IValidator.Validator;
import { UserExecutor } from "./UserExecutor";
const log = require('log4js').getLogger('user');
export class UserRouter extends Router {
    constructor(request) {
        super(request);
    }
    static async execute(request) {
        try {
            return await UserRouter._execute(request);
        }
        catch (e) {
            const error = IServer.Errors.innerError(e.stack);
            log.error(' // ' + e.stack);
            return new IServer.Response(error);
        }
    }
    static async _execute(request) {
        const executor = new UserRouter(request);
        return await executor.run();
    }
    async run() {
        switch (super.url.method) {
            case 'get.partially.hidden.login':
                return this.getPartiallyHiddenLoginHandler();
            default:
                throw Errors.invalidUrlHandler();
        }
    }
    get data() {
        return this.request.query.data;
    }
    async getPartiallyHiddenLoginHandler() {
        let user_id = Validator.toId(this.data.user_id);
        const result = await UserExecutor.self.getPartiallyHiddenLogin(user_id);
        return new Response(result);
    }
}
UserRouter.handler = async (req, res) => {
    let response = await UserRouter.execute(req);
    if (response.result.error)
        res.sendStatus(500);
    res.send(response);
};
//# sourceMappingURL=UserRouter.js.map