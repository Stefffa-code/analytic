import {Router} from "../../MainRouterHandler";
import {IServer} from "../../IServer";
import IRequest = IServer.IRequest;
import Errors = IServer.Errors;
import {IBDepartmentsFabric} from "./DepartmentsFabric";

import Response = IServer.Response;
import BDepartmentsFabric = IBDepartmentsFabric.BDepartmentsFabric;
import {IValidator} from "../../validator/Validator";
import Validator = IValidator.Validator;
import {ICommonDepartment} from "./ICommonDepartment";
import IDepartStruct = ICommonDepartment.IDepartStruct;
import ICreateStruct = ICommonDepartment.ICreateStruct;
import IUpdateStruct = ICommonDepartment.IUpdateStruct;
const log = require('log4js').getLogger('departments');




export  class DepartmentsRouter extends Router {
  constructor(request: IRequest ) {
    super(request)
  }

  static handler = async(req: any, res: any): Promise<void> => {
    let response = await DepartmentsRouter.execute(req)
    if(response.result.error)
      res.sendStatus(500);
    res.send(response)
  }

  private static async execute(request: IRequest): Promise<IServer.IResponse>{
    try {
      return await DepartmentsRouter._execute(request)
    } catch(e) {
      const error = IServer.Errors.innerError(e.stack)
      log.error(' // ' + e.stack)
      return new IServer.Response(error)
    }
  }

  private static async _execute(request: any): Promise<IServer.IResponse>{
    const executor = new DepartmentsRouter(request)
    return await executor.run()
  }


  async run(): Promise<IServer.Response> {
    switch(super.url.method) {
      case 'get':
        return this.getHandler()
      case 'create':
        return await this.createHandler()
      case 'update':
        return await this.updateHandler()
      case 'delete':
        return await this.deleteHandler()
      default:
        throw Errors.invalidUrlHandler()
    }
  }

  private get data(): any {
    return this.request.query.data
  }

  private async getHandler(): Promise<Response> {
    let account_id: number = Validator.toId(this.data.account_id)
    const result = await BDepartmentsFabric.self.getAll(account_id)
    return new Response(result)
  }

  private async createHandler(): Promise<Response> {
    let validData = this.validateCreateData(this.data)
    const result = await BDepartmentsFabric.self.create(validData)
    return new Response(result)
  }

  private async updateHandler(): Promise<Response> {
    let validData = this.validUpdateData(this.data)
    const result = await BDepartmentsFabric.self.update(validData)
    return new Response(result)
  }

  private async deleteHandler(): Promise<Response> {
    const result = await BDepartmentsFabric.self.remove(this.data)
    return new Response(result)
  }


  private validateCreateData( data: ICreateStruct[]): ICreateStruct[]{
    return data.map(item => {
      return {
        title:  Validator.isTitle(item.title ),
        account_id: Validator.toId(item.account_id)
      }
    })
  }

  private validUpdateData( data: IUpdateStruct[]): IUpdateStruct []{
    return data.map(item => {
      return {
        title:  Validator.isTitle(item.title ),
        account_id: Validator.toId(item.account_id),
        id: Validator.toId(item.id),
        head_id: Validator.toIdOrNull(item.head_id ),
        parent_department_id: Validator.toIdOrNull(item.parent_department_id)
      }
    })
  }

  private validDepartData( data: IDepartStruct[]): IDepartStruct[]{
    return data.map(item => {
      return {
        title:  Validator.isTitle(item.title ),
        account_id: Validator.toId(item.account_id),
        id: Validator.toId(item.id),
        employees_id: Validator.toIds(item.employees_id),
        head_id: Validator.toIdOrNull(item.head_id ),
        parent_department_id: Validator.toIdOrNull(item.parent_department_id)
      }
    })
  }


}