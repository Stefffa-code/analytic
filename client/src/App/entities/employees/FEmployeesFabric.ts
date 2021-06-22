import * as axios from "../../core/axios";
import {IEntitiesShort} from "../../types/types";



export namespace  IEmployeeSpace {

  export interface IEmployee {
    id: number
    name: string
    email: string | null
    confirm_email: number
    phone: string | null
    access: string | null
  }


  export interface IFEmployeeFabric {
    employees: IEmployee[];
    init(account_id: number): void
    find(id: number | null): IEmployee | undefined
    findAll(ids: number[] ): IEmployee[]
  }




  export class FEmployeesFabric implements IFEmployeeFabric{
    private readonly baseUrl: string = '/api/entities/employees'
    private _employees: IEmployee[] = []
    private _entities_short: IEntitiesShort[] = []
    private _owner: IEmployee | undefined = undefined

    private static _self: FEmployeesFabric

    static get self(): FEmployeesFabric {
      if(FEmployeesFabric._self) return FEmployeesFabric._self
      FEmployeesFabric._self = new FEmployeesFabric()
      return FEmployeesFabric._self
    }

    get data(): IEmployee[]{
      return this._employees
    }

    get shortEntities():IEntitiesShort[] {
      return this._entities_short
    }

    get employees(): IEmployee[]{
      return this._employees
    }

    get owner(): IEmployee | undefined{
      return this._owner
    }

    get urlGet(): string {
      return this.baseUrl + '/get.all'
    }

    async init(account_id: number){
      await this.getAll(account_id)
    }

    async getAll(account_id: number): Promise<IEmployee[]>{
      let res = await axios.update(this.urlGet, {data: {account_id: account_id} })
      if(!res.length) return []
       this.saveInstances(res)
      this._defineOwner()
      return this._employees
    }

    private  saveInstances(res: any): IEmployee[]{
      return  res.map(model => {
        let employee = new Employee(model)
        this._employees.push(employee.model)
        this._entities_short.push(employee.entityShort)
      })
    }

    private  _defineOwner(){
      this._owner = this.employees.find(i => i.access == 'owner')
    }

    find(id: number | null): IEmployee | undefined{
      if(!id) return;
      return this.employees.find(i => i.id == id)
    }

    findAll(ids: number[]): IEmployee[] {
      if(!ids) return [];
      let finded = this.employees.filter( user => ids.includes(user.id) )
      return finded.length ? finded : []
    }
  }



  class Employee implements IEmployee{
    readonly  access: string | null;
    readonly  confirm_email: number;
    readonly  email: string | null;
    readonly  id: number;
    readonly  name: string;
    readonly  phone: string | null;

    constructor(model: any){
      this.access = model.access
      this.confirm_email = model.confirm_email
      this.email = model.email
      this.id = model.id
      this.name  = model.name
      this.phone = model.phone
    }

    get model(): IEmployee{
      return {
        access: this.access,
        confirm_email: this.confirm_email,
        email: this.email,
        id: this.id,
        name: this.name,
        phone: this.phone,
      }
    }

    get entityShort(): IEntitiesShort{
      return {
        id: this.id,
        name: this.name,
      }
    }
  }

}
