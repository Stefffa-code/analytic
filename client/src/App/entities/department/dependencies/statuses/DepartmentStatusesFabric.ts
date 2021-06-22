import {ICommonSTD} from "../../../../../../../server/entities/dependencies/statusesToDepartment/ICommonSTD";
import IChangesSTD = ICommonSTD.IChangesSTD;
import IItemSTD = ICommonSTD.IItemSTD;
import {IVueStage} from "../../../segment/FStageFabric";
import Status = IVueStage.Status;
import {IDepartmentsFabricSpace} from "../../FDepartmentsFabric";import Department = IDepartmentsFabricSpace.Department;
import FStagesFabric = IVueStage.FStagesFabric;
import * as axios from "../../../../core/axios";


interface IDepartmentStatusesFabric {
  getAll(account_id: number): Promise<void>
  createLinks(structs: IChangesSTD[]): Promise<void>
  deleteLinks(structs: IChangesSTD[]): Promise<void>
  updateItemsName(structs: IItemSTD[]): Promise<void>
}

export class FDepartmentStatusesFabric implements IDepartmentStatusesFabric{
  private _baseUrl: string = '/api/dependencies/status_to_department'
  private _account_id: number = 0
  private _data: StatusesLinksBase[] = []

  private static  _self
  static get self(){
    if(FDepartmentStatusesFabric._self)
      return FDepartmentStatusesFabric._self
    FDepartmentStatusesFabric._self = new FDepartmentStatusesFabric()
    return FDepartmentStatusesFabric._self
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

  get urlUpdate(){
    return this.baseUrl + '/update.name'
  }

  async init(account_id: number){
    this._account_id = account_id
    await this.getAll(account_id)
  }

  async getAll(account_id): Promise<void> {
    let result = await axios.get(this.urlGet, {data: {account_id: this.accountId}} )
    this._data = this._createModels(result)
  }

  private _createModels(data: any): StatusesLinksBase[]{
    return data.map(item => new StatusesLinksBase(item))
  }

  createStatusesInstances(){
    this._data = this._data.map( item => new StatusesLinks(item.department_id) )
  }

  addDepartmentLinkHandler(data: StatusesLinksBase){
    let finded = this.data.find( i => i.department_id === data.department_id )
    if(!finded){
      this._data.push(data)
    }
  }

  async createLinks(structs: IChangesSTD[]): Promise<void> {
    let result = await axios.get(this.urlAdd, {data: {
      account_id: this.accountId,
      structs,
    }})
  }

  async deleteLinks(structs: IChangesSTD[]): Promise<void> {
    let result = await axios.get(this.urlDelete, {data: {
      account_id: this.accountId,
      structs,
    }})
  }

  async updateItemsName(structs: IItemSTD[]): Promise<void> {
    await axios.get(this.urlDelete, {data: {
        account_id: this.accountId,
        structs
    }})
  }

  find (department_id: number): StatusesLinksBase | undefined{
    if(!department_id) return;
    return this.data.find( d => d.departmentId == department_id)
  }

  findAll(departments_id: number[]): StatusesLinksBase[]{
    if(!departments_id.length) return [];
    return this.data.filter(item => departments_id.includes(item.departmentId))
  }
}


export interface ILinksDepartmentStatuses {
  department_id: number,
  statuses_id: number[]
  name?: string,
}




class StatusesLinksBase{
  readonly department_id: number
  protected _statuses_id: number[] = []
  protected  _name?: string


  constructor(data: any | number) {
    if(typeof data == 'number'){
      this.department_id = data
      this._setStatusesLinks(data)
    } else {
      this.department_id = data.department_id
      this._statuses_id = data.statuses_id
      this._name = data.name
    }
  }

  private _setStatusesLinks(department_id: number){
    let link = FDepartmentStatusesFabric.self.find(department_id)
    if(!link){
      this._statuses_id = []
      FDepartmentStatusesFabric.self.addDepartmentLinkHandler(this)
      return
    }
    this._statuses_id = link._statuses_id
    this._name = link.name
  }

  get departmentId(): number{
    return this.department_id
  }

  get statusesId(): number[]{
    return this._statuses_id
  }
  get name(): string | undefined{
    return this._name
  }

  get baseModel(): ILinksDepartmentStatuses {
    return {
      department_id: this.department_id,
      statuses_id: this.statusesId,
      name: this.name
    }
  }
}



export class StatusesLinks extends  StatusesLinksBase {
  private fabric = FDepartmentStatusesFabric.self
  protected _statuses: Status[] = []
  protected _department: Department | null = null

  get statuses(): Status[]{
    return this._statuses
  } 

  get department(): Department {
    return <Department>this._department
  }

  constructor(department_id: number) {
    super(department_id)
    this._joinStatuses()
  }

  private _joinStatuses(){
    if(!this.statusesId)
      return [];
    this._statuses = FStagesFabric.self.findAll(this.statusesId)
  }

  async create(statuses_id: number[]){
    await this.fabric.createLinks([{
      department_id: this.departmentId,
      statuses_id
    }])
    this._addStatuses(statuses_id)
  }

  private _addStatuses(statuses_id: number[]){
    let newIds = [...this.statusesId, ...statuses_id]
    this._statuses_id = newIds
    let addStatuses = FStagesFabric.self.findAll(statuses_id)
    this._statuses = [...this._statuses, ...addStatuses]
  }


  async destroy(statuses_id: number[]){
    await this.fabric.deleteLinks([{
      department_id: this.departmentId,
      statuses_id
    }])
    this._removeStatuses(statuses_id)
  }

  private _removeStatuses(statuses_id: number[]){
    this._statuses_id = this.statusesId.filter(id => !statuses_id.includes(id))
    this._statuses = this.statuses.filter(item => !statuses_id.includes(item.id))
  }

}
