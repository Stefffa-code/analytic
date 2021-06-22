import * as axios from '../../core/axios'
import {IEmployeeSpace} from "../employees/FEmployeesFabric";
import {ICommonDepartment} from "../../../../../server/entities/department/ICommonDepartment";
import {IDepartment, IDepartmentShort, IEntitiesShort} from "../../types/types";

import {
  FDepartmentStatusesFabric,
  StatusesLinks
} from "./dependencies/statuses/DepartmentStatusesFabric";

import {EmployeesLinks, FDepartmentEmployeesFabric} from "./dependencies/employees/FDepartmentEmployeesFabric";

import {IVueStage} from "../segment/FStageFabric";
import {Emitter} from "../../core/Emitter";




export namespace IDepartmentsFabricSpace {
  import IEmployee = IEmployeeSpace.IEmployee;
  import EmployeesFabric = IEmployeeSpace.FEmployeesFabric;
  import BaseDepartment = ICommonDepartment.BaseDepartment;
  import IDepartmentAction = ICommonDepartment.IDepartmentAction;
  import ICreateStruct = ICommonDepartment.ICreateStruct;
  import IDepartStruct = ICommonDepartment.IDepartStruct;
  import Status = IVueStage.Status;
  import FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;

  export interface IFDepartmentsFabric {
    remove(ids: Array<number>): Promise<void>
    update(struct: Array<IDepartStruct>): Promise<void>
    create(struct: Array<ICreateStruct >): Promise<Array<Department>>
  }

  export class FDepartmentsFabric implements IFDepartmentsFabric {
    private readonly baseUrl: string = '/api/entities/departments'
    private _departments: Department[] = []
    // @ts-ignore
    private  _account_id: number

    private static _self

    static get self() {
      if(FDepartmentsFabric._self)
        return FDepartmentsFabric._self
      FDepartmentsFabric._self = new FDepartmentsFabric()
      return FDepartmentsFabric._self
    }

    protected get accountId(){
      return this._account_id
    }

    async init( account_id: number) {
      this._account_id = account_id
      await Promise.all([
        this.load(account_id),
        FDepartmentStatusesFabric.self.init(account_id),
        FDepartmentEmployeesFabric.self.init(account_id)
      ])
    }

    async joinEntities(){
      FDepartmentStatusesFabric.self.createStatusesInstances()
      FDepartmentEmployeesFabric.self.createInstances()
      this.departments.forEach(item => item.createLinks())
      await this.addDefaultDepartment()
    }

    private async addDefaultDepartment(){
      let defaultDepartment = new Department(this,{
        account_id: this.accountId,
        id: 0,
        title: 'Default',
        employees_id: this.defineUsersInDefaultDepartment(),
      })
      this._departments.push(defaultDepartment)
      await defaultDepartment.createLinks()
    }

    private defineUsersInDefaultDepartment(){
      let employeesId = FEmployeesFabric.self.data.map( i => i.id)
      let usersInDepartments: number[] = []
      this.data.forEach( d => usersInDepartments.push(...d.employeesId))
      let usersInDefaultDepartment: number[] = []

      employeesId.forEach( id => {
        if( !usersInDepartments.includes(id) ){
          usersInDefaultDepartment.push(id)
        }
      })
      return usersInDefaultDepartment
    }

    get data(): Department[] {
      return this._departments
    }

    get departments(): Department[] {
      return this._departments
    }

    get shortModels():IDepartmentShort[]{
      return this.departments.map( d => d.short)
    }

    get shortEntities():IEntitiesShort[]{
      return this.departments.map( d => d.entityShort)
    }

    private setDepartments(departments: Array<Department>) {
      this._departments = departments
    }

    get urlGet(): string {
      return this.baseUrl + '/get'
    }

    get urlCreate(): string {
      return this.baseUrl + '/create'
    }

    get urlUpdate(): string {
      return this.baseUrl + '/update'
    }

    get urlDestroy(): string {
      return this.baseUrl + '/delete'
    }

    async create(struct?: ICreateStruct[] ): Promise<Array<Department>> {
      let createData: ICreateStruct[] = []

      if(struct?.length) createData = struct;
      else createData = [{
        account_id: this.accountId,
        title: "Название отдела"
      }]

      const models = await axios.post(this.urlCreate, {data:[ ...createData ]})

      let departments =  this.createInstances(models)
      departments.forEach( i => i.createLinks())
      this.concatDepartment(departments)
      Emitter.self.emit('departments_changed', this.departments)
      return departments
    }

    private concatDepartment(departments: Department[] ){
      this._departments = [ ...this._departments, ...departments]
    }

    async remove(ids: Array<number>): Promise<void> {
      let res = await axios.remove(this.urlDestroy, {data: [...ids] })
      if(res){
        this.deleteDepartment(ids)
        Emitter.self.emit('departments_changed', this.departments)
      }
    }

    private deleteDepartment(ids: number[] ){
      let newDep: Department[]

      newDep = this._departments.filter(dep => !ids.includes(dep.id))
      this._departments = newDep
    }

    async update(struct: Array<IDepartStruct>): Promise<void> {
      await axios.update(this.urlUpdate, {data: [...struct] })
    }

    private async load(account_id: number): Promise<void> {
      const models = await axios.get(this.urlGet, {account_id})
      const departments = this.createInstances(models)
      this.setDepartments(departments)
    }


    private createInstances(models: Array<IDepartStruct>): Array<Department> {
      return models.map(model => {
        return new Department(this, model)
      })
    }

    findAll(ids: number[]): Department[]  {
      if(!ids.length) return [];
      return this._departments.filter(item => ids.includes(item.id))
    }

    find(id: number ): Department | undefined {
      if(!id) return;
      return this._departments.find(item => item.id == id)
    }
  }





  export class Department extends BaseDepartment {
    private fabric: FDepartmentsFabric
    private _head: IEmployee | undefined | null  = null
    private _parent_department: IDepartmentAction | null = null
    private statusesLinks: StatusesLinks | null = null
    private employeesLinks: EmployeesLinks | null = null

    get name(){
      return this._title
    }

    get head(){
      return this._head
    }

    constructor(fabric: FDepartmentsFabric, model: any ) {
      super(model)
      this.fabric = fabric
    }

    async createLinks(){
      this._joinHead()
      this._joinHeadDepartment()
      this.statusesLinks = new StatusesLinks(this.id)

      let data: any = this.id
      if(this.id === 0){
        data = {
          department_id: this.id,
          employees_id: this.employeesIdBase
        }
      }

      this.employeesLinks = new EmployeesLinks(data)
    }

    private _joinHead(): void{
      let head = EmployeesFabric.self.find(this.headId)
      if(!head) return;
      this._head = head
    }

    private _joinHeadDepartment(): void{
      // let headDepartment = FDepartmentsFabric.self.findOne(this.parentDepartmentId)
      // if(!headDepartment) return;
      // this.setHeadDepartment(headDepartment)
    }

    get baseModel():  IDepartStruct{
      return {
        account_id: this.account_id,
        id: this.id,
        title: this.title,
        head_id: this._head_id,
        parent_department_id: this._parent_department_id,
        employees_id: this.employeesId
      }
    }

    get short():IDepartmentShort{
      return {
        id: this.id,
        users_id: this.employeesId,
        statuses_id: this.statusesId
      }
    }

    get entityShort(): IEntitiesShort{
      return {
        id: this.id,
        name: this.name,
        children: this.employeesShort
      }
    }

    get model(): IDepartment{
      return {
        account_id: this.account_id,
        id: this.id,
        name: this.title,
        head: this.head,
        parent_department_id: this._parent_department_id,
        employees_id: this.employeesId,
        employees: this.employees,
        statuses: this.statuses,
        statuses_id: this.statusesId
      }
    }

    async changeTitle(title: string): Promise<void> {
      if(!title) return;
      this._title = title
      await this.fabric.update([this.baseModel])
    }

    async changeHead(employee_id?: number){
      if(!employee_id){
        this._head_id =  null
        this._head = undefined
      } else {
        this._head_id = employee_id
        this._joinHead()
      }
      await this.fabric.update([this.baseModel])
    }

    async changeHeadDepartment(department_id?: number): Promise<void> {
      if(!department_id){
        this._parent_department_id =  null
        this._parent_department = null
      } else {
        this._parent_department_id = department_id
        this._joinHeadDepartment()
      }
      await this.fabric.update([this.baseModel])
    }

    get statuses(): Status[]{
      if(!this.statusesLinks){
        throw Error('statusesLinks object not created')
      }
      return this.statusesLinks.statuses
    }

    get statusesId(): number[]{
      if(!this.statusesLinks){
        throw Error('statusesLinks object not created')
      }
      return this.statusesLinks.statusesId
    }

    async createStatusesLinks(statuses_id: number[]){
      await this.statusesLinks?.create(statuses_id)
    }

    async deleteStatusesLinks(statuses_id: number[]){
      await this.statusesLinks?.destroy(statuses_id)
    }

    get employees(): IEmployee[]{
      if(!this.employeesLinks){
        throw Error('employeesLinks object not created')
      }
      return this.employeesLinks.employees
    }

    get employeesShort(): IEntitiesShort[]{
      if(!this.employeesLinks){
        throw Error('employeesLinks object not created')
      }
      return this.employeesLinks.employeesShort
    }

    get employeesId(): number[]{
      if(!this.employeesLinks){
        throw Error('employeesLinks object not created')
      }
      return this.employeesLinks.employeesId
    }

    async createEmployeesLinks(employees_id: number[]): Promise<void> {
      if(!employees_id.length)
        return;
      await this.employeesLinks?.create(employees_id)
    }

    async deleteEmployeesLinks(employees_id: number[]): Promise<void> {
      if(!employees_id.length)
        return;
      await this.employeesLinks?.destroy(employees_id)
    }
  }
}
