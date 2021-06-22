import {Router} from "../../../MainRouterHandler";
import {IServer} from "../../../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import {IValidator} from "../../../validator/Validator";
import Validator = IValidator.Validator;
import Response = IServer.Response;
import {BDepartmentUsersFabric} from "./BDepartmentUsersFabric";
import {IUsersToDepartment} from "./ICommonUTD";
import IChangeUTD = IUsersToDepartment.IChangeUTD;
const log = require('log4js').getLogger('users_to_department');




export class DepartmentToUsersRouter extends Router {

    static handler = async(req: any, res: any): Promise<void> => {
        let response = await DepartmentToUsersRouter.execute(req)
        if(response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse>{
        try {
            return await DepartmentToUsersRouter._execute(request)
        } catch(e) {
            const error = Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse>{
        const executor = new DepartmentToUsersRouter(request)
        return await executor.run()
    }

    constructor(request: IRequest ) {
        super(request)
    }


    async run(): Promise<IServer.Response> {
        switch(super.url.method) {
            case 'get':
                return this.getHandler();
            case 'add':
                return this.addUsersHandler();
            case 'delete':
                return await this.deleteUsersHandler();
            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private get data(): any  {
        return this.request.query.data
    }

    private async getHandler(): Promise<Response> {
        let account_id: number = Validator.toId(this.data.account_id)
        const result = await  BDepartmentUsersFabric.self.getAll(account_id)
        return new Response(result)
    }

    private async addUsersHandler(): Promise<Response> {
        let validData = this.validChangesData()
        const result = await  BDepartmentUsersFabric.self.createLinks(validData)
        return new Response(result)
    }

    private async deleteUsersHandler(): Promise<Response> {
        let validData = this.validChangesData()
        const result = await  BDepartmentUsersFabric.self.destroyLinks(validData)
        return new Response(result)
    }


    private validChangesData(): IChangeUTD[]{
        return this.data.map( (item: IChangeUTD) => {
            return {
                department_id: Validator.toId(item.department_id),
                employees_id: Validator.toIds(item.employees_id)
            }
        })
    }



}