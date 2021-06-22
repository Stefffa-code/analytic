 import {IEntitiesShort, IStatus} from "../../types/types";
import * as axios from "../../core/axios";
 import {ICommonStatuses} from "../../../../../server/entities/pipelines/statuses/ICommonStatuses";
 import {Emitter} from "../../core/Emitter";



export namespace IVueStage{
  // import ICreateStage = ICommonStatuses.ICreateStage;
  import ILinkStatuses = ICommonStatuses.ILinkStatuses;

  interface ICreateStage {
    pipeline_id: number,
    name: string,
    color?: string,
  }

  export interface IStagesFabric {
    getAll(account_id: number): Promise<Status[]>
    getInPipelines(pipelines_id: number[]): Promise<Status[]>
    createStages(structs: ICreateStage[]): Promise<Status[]>
    updateStages(structs: IStatus[]): Promise<boolean>
    deleteStages(stages_id: number[]): Promise<any>

    addLinksStatusesToStage(structs: ILinkStatuses[]): Promise<any>
    deleteLinksStatusesToStage(structs: ILinkStatuses[]): Promise<any>
  }


  export class FStagesFabric implements IStagesFabric {

    private readonly baseUrl: string = '/api/entities/statuses'
    private static _self
    private _statuses: Status[] =[]
    private  _fail_status: Status | undefined
    private _success_status: Status | undefined

    get statuses(): Status[]{
      return this._statuses
    }

    get data(): Status[]{
      return this._statuses
    }

    private _setStatuses(statuses: Status[] ): void{
      this._statuses = statuses
    }

    static get self() {
      if(FStagesFabric._self)
        return FStagesFabric._self
      FStagesFabric._self = new FStagesFabric()
      return FStagesFabric._self
    }

    protected constructor() {
    }

    get failStatus():IStatus{
      // @ts-ignore
      return this._fail_status.model
    }

    get successStatus(): IStatus{
      // @ts-ignore
      return this._success_status.model
    }

    get urlGet(): string {
      return this.baseUrl + '/get'
    }

    get urlGetClosed(): string {
      return this.baseUrl + '/get.closed'
    }

    get urlGetInPipelines(): string {
      return this.baseUrl + '/get.in.pipelines'
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

    get urlAddLinks(): string {
      return this.baseUrl + '/statuses.add'
    }

    get urlDeleteLinks(): string {
      return this.baseUrl + '/statuses.delete'
    }



    async init(account_id: number){
      await this.getAll(account_id)
      await this._getClosedStatuses()
    }


    async getInPipelines(pipelines_id: number[]): Promise<Status[]> {
      let result = await axios.get(this.urlGetInPipelines, {data: pipelines_id})
      return this._fetshResulHandler(result)
    }

    private _fetshResulHandler(result: any){
      let statuses = result.filter(p => !p.multiple)
      let statusIns = this._createInstances(statuses)
      this._setStatuses(statusIns)
      let stages =  result.filter(p => p.multiple)
      let stageInsts = this._createInstances(stages)
      this._setStatuses( statusIns.concat(stageInsts) )
      return this.statuses
    }

    async getAll(account_id: number): Promise<Status[]> {
      let result = await axios.get(this.urlGet, {data: {account_id}})
      return this._fetshResulHandler(result)
    }

    private async _getClosedStatuses()  {
      let result = await axios.get(this.urlGetClosed)
      this._fail_status = new Status(result.fail)
      this._success_status = new Status(result.success)
    }

    async createStages(structs: ICreateStage[]): Promise<Status[]> {
      let createData = this._sanitizeCreateData(structs)
      let result = await axios.post(this.urlCreate, {data: createData})
      let instances =  this._createInstances(result)
      let newdata = [...this._statuses, ...instances]
      this._statuses = newdata
      return instances
    }

    private _addToStatuses(models: Status[]): void{
      let newData = [...this._statuses, ...models]
      this._setStatuses(newData)
    }

    private _sanitizeCreateData(structs): ICreateStage[]{
      if(!structs.length)
        return [];
      return structs.map(model => {
        if(!model.pipeline_id) throw new Error("Pipeline id not specified!")
        return{
          pipeline_id: model.pipeline_id,
          name: model.name ||  "Этап",
          color: model.color ||  "#000000",
          sort: model.sort ||  10,
        }
      })
    }

    private _createInstances(models: IStatus[]): Status[] {
      if(!models.length)
        return [];
      return models.map(model => {
        if(model.multiple)
          return new Stage(model);
        return new Status(model)
      })
    }

    async updateStages(structs: IStatus[]): Promise<boolean> {
      let result = await axios.update(this.urlUpdate, {data: structs})
      return true
    }

    async deleteStages(stages_id: number[]): Promise<boolean> {
      let result = await axios.remove(this.urlDestroy, {data: stages_id})
      this._deleteFromStatuses(stages_id)
      Emitter.self.emit('delete_statuses')
      return true
    }

    private _deleteFromStatuses(statuses_id: number[]):void{
      let newData = this.statuses.filter(item => !statuses_id.includes(item.id))
      this._setStatuses(newData)
    }

    async addLinksStatusesToStage(structs: ILinkStatuses[]): Promise<boolean> {
      let result = await axios.remove(this.urlAddLinks, {data: structs})
      return true
    }

    async deleteLinksStatusesToStage(structs: ILinkStatuses[]): Promise<boolean> {
      let result = await axios.remove(this.urlDeleteLinks, {data: structs})
      return true
    }

    findAll(statuses_id: number[]): Status[]{
      if(!this.statuses.length) return [];
      let res =  this.statuses.filter(item => statuses_id.includes(item.id))
      return res;
    }

    find(status_id: number): Status | undefined {
      if(!this.statuses.length)
        return undefined;
      return this.statuses.find(item => item.id == status_id)
    }

    findByPipline(pipeline_id: number): Status[]{
      if(!this.statuses.length) return [];
      return this.statuses.filter(item => item.pipeline_id == pipeline_id)
    }
  }


  export class Status {
    readonly id: number;
    readonly multiple: boolean;
    readonly pipeline_id: number;
    protected _color: string;
    protected _name: string;
    protected _sort: number;
    protected _statuses_id: number[];

    constructor(model: any) {
      this.id = model.id
      this.multiple = model.multiple
      this.pipeline_id = model.pipeline_id
      this._color = model.color
      this._name = model.name
      this._sort = model.sort
      this._statuses_id = model.statuses_id
    }

    get model(): IStatus{
      return {
        id: this.id,
        multiple: this.multiple,
        pipeline_id: this.pipeline_id,
        color: this._color,
        name: this.name,
        sort: this.sort,
        statuses_id: this._statuses_id
      }
    }

    get entityShort(): IEntitiesShort{
      return {
        id: this.id,
        name: this.name,
      }
    }

    get statusesId(): number[]{
      return this._statuses_id
    }

    get name(): string{
      return this._name
    }

    get sort(): number{
      return this._sort
    }

    protected setName(name: string){
      if(!name) return
      this._name = name
    }

    protected setColor(color: string){
      if(!color) return
      this._color = color
    }

    protected addLinks(statuses_id: number[]){
      this._statuses_id = [...this._statuses_id, ...statuses_id]
    }

    protected deleteLinks(statuses_id: number[]){
      let newStatuses = this._statuses_id.filter(id => !statuses_id.includes(id))
      this._statuses_id = newStatuses
    }

  }


  export class Stage extends Status{
    private static fabric = FStagesFabric.self
    static defaultName = 'Этап-'
    static defaultNamePattern = new RegExp('^Этап-*')

    static async create(segment_id: number, nameCount:number):Promise<Status>{
      let sruct = {
        pipeline_id: segment_id,
        name: Stage.defaultName + nameCount
      }

      let res = await Stage.fabric.createStages([sruct])
      return res[0]
    }

    private _linkedStatuses:Status[] = []

    constructor(model: any) {
      super(model);
      this._joinLinkedStatuses()
    }

    get linkedStatuses(): Status[]{
      return this._linkedStatuses
    }


    private _joinLinkedStatuses(){
      this._linkedStatuses = FStagesFabric.self.findAll(this.statusesId)
    }


    async destroy():Promise<boolean>{
      await Stage.fabric.deleteStages([this.id])
      return true
    }

    async updateName(name: string){
      this.setName(name)
      await  Stage.fabric.updateStages([this.model])
    }

    async updateColor(color: string){
      this.setName(color)
      await  Stage.fabric.updateStages([this.model])
    }

    async addLinkedStatuses(statuses_id: number[]){
      let struct = {
        segment_id: this.pipeline_id,
        stage_id: this.id,
        statuses_id
      }

      await Stage.fabric.addLinksStatusesToStage([struct])
      this.addLinks(statuses_id)
      await this._updateSort()
    }


    async deleteLinkedStatuses(statuses_id: number[]){
      let struct = {
        segment_id: this.pipeline_id,
        stage_id: this.id,
        statuses_id
      }
      await Stage.fabric.deleteLinksStatusesToStage([struct])
      this.deleteLinks(statuses_id)
      await this._updateSort()
    }

    private async _updateSort(){
      let newSort = this._recalculationSort()
      this._setSort(newSort)
      await  Stage.fabric.updateStages([this.model])
    }

    private _setSort(sort: number){
      if(sort < 10) throw new Error("Sort must be 10 or up")
      this._sort = sort
    }

    private _recalculationSort(): number{
      let statuses = FStagesFabric.self.findAll(this.statusesId)
      if(!statuses.length)
        return 10;
      return this._getAvg(statuses.map(i => i.sort))
    }

    private _getAvg(nums: number[]){
      return Math.round(nums.reduce( (a,b) => a + b ) / nums.length )
    }

  }

}
