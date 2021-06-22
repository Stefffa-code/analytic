import * as axios from "../../../../core/axios";
import {IEmployeeSpace} from "../../../employees/FEmployeesFabric";
import IEmployee = IEmployeeSpace.IEmployee;
import FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
import {IEntitiesShort} from "../../../../types/types";



export class FDepartmentEmployeesFabric{
  private _baseUrl: string = 'api/dependencies/employees_to_department'
  private _account_id: number = 0
  private _data: EmployeesLinkBase[] = []

  private static  _self
  static get self(){
    if(FDepartmentEmployeesFabric._self)
      return FDepartmentEmployeesFabric._self
    FDepartmentEmployeesFabric._self = new FDepartmentEmployeesFabric()
    return FDepartmentEmployeesFabric._self
  }

  get data(){
    return this._data
  }

  get accountId(){
    return this._account_id
  }

  get baseUrl(){
    return this._baseUrl
  }

  get urlGet(){
    return this.baseUrl + '/get'
  }

  get urlAdd(){
    return this.baseUrl + '/add'
  }

  get urlDelete(){
    return this.baseUrl + '/delete'
  }

  async init(account_id: number){
    this._account_id = account_id
    await this.getAll()
  }

  async getAll(): Promise<void> {
    let result = await axios.get(this.urlGet, {data: {account_id: this.accountId}} )
    this._data = this._createBaseInstance(result)
  }

  private _createBaseInstance(data: any): EmployeesLinkBase[]{
    return data.map(item => new EmployeesLinkBase(item))
  }

  createInstances(){
    this._data = this._data.map( item => new EmployeesLinks(item.department_id) )
  }

  async createLinks(structs: ILinkDepartmentEmployee[]): Promise<void> {
    let result = await axios.get(this.urlAdd, {data: structs })
  }

  async deleteLinks(structs: ILinkDepartmentEmployee[]): Promise<void> {
    let result = await axios.get(this.urlDelete, {data:  structs})
  }

  addDepartmentLinkHandler(data: EmployeesLinkBase){
    let finded = this.data.find( i => i.department_id === data.department_id )
    if(!finded){
      this._data.push(data)
    }
  }

  find (department_id: number): EmployeesLinkBase | undefined{
    if(!department_id) return;
    return this.data.find( d => d.department_id == department_id)
  }

  findAll(departments_id: number[]): EmployeesLinkBase[]{
    if(!departments_id.length) return [];
    return this.data.filter(item => departments_id.includes(item.department_id))
  }
}



export interface ILinkDepartmentEmployee {
  department_id: number,
  employees_id: number[]
}


class EmployeesLinkBase{
  readonly department_id: number
  protected _employees_id: number[] = []

  constructor(data:any | number){
    if(typeof data == 'number'){
      this.department_id = data
      this._setEmployeesLinks(data)
    } else {
      this.department_id = data.department_id
      this._employees_id = data.employees_id
    }
  }

  private  _setEmployeesLinks(department_id: number){
    let link = FDepartmentEmployeesFabric.self.find(department_id)
    if(!link){
      this._employees_id = []
      FDepartmentEmployeesFabric.self.addDepartmentLinkHandler(this)
      return
    }
    this._employees_id = link.employeesId
  }

  get employeesId(){
    return this._employees_id
  }

  get departmentId(){
    return this.department_id
  }

}

 export class EmployeesLinks extends EmployeesLinkBase {
  private fabric = FDepartmentEmployeesFabric.self
   protected _employees: IEmployee[] = []

   get employees(): IEmployee[]{
     return this._employees
   }

   get employeesShort(): IEntitiesShort[]{
     return this._employees.map( i => {
       return {
         id: i.id,
         name: i.name
       }
     })
   }

  constructor(department:number,  ){
    super(department)
    this._joinEmployees()
  }

  private _joinEmployees(){
    if(!this.employeesId)
      return [];

    this._employees =  FEmployeesFabric.self.findAll(this.employeesId)
  }

   async create(employees_id: number[]){
     await this.fabric.createLinks([{
       department_id: this.departmentId,
       employees_id: employees_id
     }])
     this._addEmployees(employees_id)
   }

   private _addEmployees(employees_id: number[]){
     let newIds = [...this.employeesId, ...employees_id]
     this._employees_id = newIds
     let addSEmployees = FEmployeesFabric.self.findAll(employees_id)
     this._employees = [...this._employees, ...addSEmployees]
   }

   async destroy(employees_id: number[]){
     await this.fabric.deleteLinks([{
       department_id: this.departmentId,
       employees_id: employees_id
     }])
     this._removeStatuses(employees_id)
   }

   private _removeStatuses(employees_id: number[]){
     this._employees_id = this.employeesId.filter(id => !employees_id.includes(id))
     this._employees = this.employees.filter(item => !employees_id.includes(item.id))
   }

}
