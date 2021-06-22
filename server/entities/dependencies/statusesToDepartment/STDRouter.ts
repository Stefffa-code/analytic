import {Router} from "../../../MainRouterHandler";
import {IServer} from "../../../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import {IValidator} from "../../../validator/Validator";
import Validator = IValidator.Validator;
import {ICommonSTD} from "./ICommonSTD";
import IChangesSTD = ICommonSTD.IChangesSTD;
import Response = IServer.Response;
import {BStatusesToDepartmentFabric} from "./STDFabric";
import IItemSTD = ICommonSTD.IItemSTD;
import IFabricDataSTD = ICommonSTD.IFabricDataSTD;
const log = require('log4js').getLogger('statuses_to_department');




export class StatusesToDepartmentRouter extends Router {

    static handler = async(req: any, res: any): Promise<void> => {
        let response = await StatusesToDepartmentRouter.execute(req)
        if(response.result.error)
            res.sendStatus(500);
        res.send(response)
    }

    private static async execute(request: IRequest): Promise<IServer.IResponse>{
        try {
            return await StatusesToDepartmentRouter._execute(request)
        } catch(e) {
            const error = Errors.innerError(e.stack)
            log.error(' // ' + e.stack)
            return new IServer.Response(error)
        }
    }

    private static async _execute(request: any): Promise<IServer.IResponse>{
        const executor = new StatusesToDepartmentRouter(request)
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
                return this.addStatusesHandler();
            case 'delete':
                return await this.deleteStatusesHandler();
            case 'update.name':
                return await this.updateItemsNameHandler();
            default:
                throw Errors.invalidUrlHandler()
        }
    }

    private get data(): any  {
        return this.request.query.data
    }

    private async getHandler(): Promise<Response> {
        let account_id: number = Validator.toId(this.data.account_id)
        const result = await  BStatusesToDepartmentFabric.self.getAll(account_id)
        return new Response(result)
    }

    private async addStatusesHandler(): Promise<Response> {
        let validData = this.validChanges()
        const result = await  BStatusesToDepartmentFabric.self.createDepartmentsLinks(validData)
        return new Response(result)
    }

    private async deleteStatusesHandler(): Promise<Response> {
        let validData = this.validChanges()
        const result = await  BStatusesToDepartmentFabric.self.deleteStatuses(validData)
        return new Response(result)
    }

    private async updateItemsNameHandler(): Promise<Response> {
        let validData = this.validItems()
        const result = await  BStatusesToDepartmentFabric.self.updateItemsName(validData)
        return new Response(result)
    }

    private validChanges(): IFabricDataSTD{
        return{
            account_id: Validator.toId(this.data.account_id),
            structs: this._validateChangesData(this.data.structs)
        }
    }

    private validItems(): IFabricDataSTD{
        return{
            account_id: Validator.toId(this.data.account_id),
            structs: this._validateItemSTD(this.data.structs)
        }
    }


    private _validateChangesData(data: any[]): IChangesSTD[]{
        return data.map( (item: any) => {
            return {
                department_id: Validator.toId(item.department_id),
                statuses_id: Validator.toIds(item.statuses_id)
            }
        })
    }

    private _validateItemSTD(data: any): IItemSTD[] {
        return data.map( (item: any) => {
            return {
                department_id: Validator.toId(item.department_id),
                status_id: Validator.toId(item.status_id ),
                name: Validator.toTitleOrNull(item.name)
            }
        })
    }


}