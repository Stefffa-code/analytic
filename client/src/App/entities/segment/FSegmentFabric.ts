 import * as axios from "../../core/axios";
 import {ICommonPipeline} from "../../../../../server/entities/pipelines/pipelines/ICommonSegments";
 import {IEntitiesShort, IPipeline, IPipelineShort} from "../../types/types";
 import {IDropStatus} from "./ViewSegment";
 import {IVueStage} from "./FStageFabric";
 import Account from "../../account/Account";
 import {AppStorage} from "../../AppStorage";



export namespace IVuePipelines{
  import ICreateSegment = ICommonPipeline.ICreateSegment;
  import ILinkSegmentToPipeline = ICommonPipeline.ILinkSegmentToPipeline;
  import Status = IVueStage.Status;
  import FStagesFabric = IVueStage.FStagesFabric;
  import ICorrectSegment = ICommonPipeline.ICorrectSegment;

  export interface ISegmentsFabric {
    getData(account_id: number): Promise<void>
    createSegment(structs:  ICreateSegment[]): Promise<Pipeline[]>
    updateSegment(structs:  IPipeline[]): Promise<boolean>
    deleteSegments(segments_id: number[] ): Promise<boolean>

    addPipelinesToSegment(structs: ILinkSegmentToPipeline[]): Promise<boolean>
    deletePipelinesFromSegment(structs: ILinkSegmentToPipeline[]): Promise<boolean>

  }


  export class FSegmentFabric implements ISegmentsFabric {
    private readonly baseUrl: string = '/api/entities/pipelines'
    private static _self
    private  _loadData: Pipeline[] = []
    private _isInit: boolean | undefined

    static get self() {
      if(FSegmentFabric._self)
        return FSegmentFabric._self
      FSegmentFabric._self = new FSegmentFabric()
      return FSegmentFabric._self
    }

    get data(): Pipeline[]{
      return this._loadData
    }

    get segments(): Pipeline[]{
      return this._loadData.filter(i => i.multiple)
    }

    get pipelines(): Pipeline[] {
      return this._loadData.filter(i => !i.multiple)
    }

    get shortModelsActive():IPipelineShort[]{
      return this.pipelines.map( pip =>  pip.shortModelActive)
    }

    get shortEntities():IEntitiesShort[]{
      return this.pipelines.map( pip =>  pip.entityShort)
    }

    private _setData(data:Pipeline[]){
      this._loadData = data
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

    get urlDelete(): string {
      return this.baseUrl + '/delete'
    }

    get urlAddLinks(): string {
      return this.baseUrl + '/pipelines.add'
    }

    get urlDeleteLinks(): string {
      return this.baseUrl + '/pipelines.delete'
    }

    get urlCheckSegments(): string {
      return this.baseUrl + '/check.segments'
    }


    async init(account_id: number){
      await this.getData(account_id)
    }

    joinStatuses(){
      this.pipelines.forEach( item => item.joinStatuses())
    }

    async getData(account_id: number): Promise<void> {
      let result = await axios.get(this.urlGet, {data: { account_id } })
      let pipelines = result.filter(p => !p.multiple)
      let pipInsts = this._createInstance(pipelines)
      this._setData(pipInsts)

      let segment = result.filter(p => p.multiple)
      let segmentInst = this._createInstance(segment)
      this._setData( pipInsts.concat(segmentInst) )
    }

    async createSegment(structs?: ICreateSegment[]): Promise<Pipeline[]> {
      let createData = this._sanitizeCreateData(structs)
      let result = await axios.get(this.urlCreate, {data: createData})
      let instances = this._createInstance(result)
      this._addToData(instances)
      return instances
    }

    private _addToData(models: Pipeline[]): void{
      let newData = [...this._loadData, ...models]
      this._setData(newData)
    }

    private  _sanitizeCreateData(structs?: ICreateSegment[]):ICreateSegment[]{
      if(!structs){
        return [{
          account_id: Number(Account.self.accountId),
          name: "Группа воронок",
          sort: 77,
        }]
      }

      return structs.map(model => {
        if(!model.account_id) throw new Error("Account id not specified!")
        return {
          account_id: Number(Account.self.accountId),
          name: model.name ||  "Группа воронок",
          sort: model.sort ||  77,
        }
      })
    }

    private _createInstance(models: IPipeline[]):Pipeline[]{
      if(!models.length)
        return [];
      return models.map(model => {
        if(model.multiple)
          return new Segment(model);
        return new Pipeline(model)
      })
    }

    async updateSegment(structs: IUpdatePipeline[]): Promise<boolean> {
      let result = await axios.get(this.urlUpdate, {data: structs})
      return true
    }

    async deleteSegments(segments_id: number[]): Promise<boolean> {
      await axios.get(this.urlDelete, {data: segments_id})
      this._deleteFromData(segments_id)
      return true
    }

    private _deleteFromData(sements_id: number[]):void{
      let newData = this.data.filter(item => !sements_id.includes(item.id))
      this._setData(newData)
    }

    async addPipelinesToSegment(structs:ILinkSegmentToPipeline[]): Promise<boolean> {
      let result = await axios.get(this.urlAddLinks, {data: structs})
      return true
    }

    async deletePipelinesFromSegment(structs: ILinkSegmentToPipeline[]): Promise<boolean> {
      let result = await axios.get(this.urlDeleteLinks, {data: structs})
      return true
    }

    async checkCorrectSegments(segments_id: number[]): Promise<ICorrectSegment[]> {
      return await axios.get(this.urlCheckSegments, {data: segments_id})
    }

    findAll(pipelines_id: number[]): Pipeline[]{
      if(!this.data.length)
        return [];
      return this.data.filter(item => pipelines_id.includes(item.id))
    }

    find(pipeline_id: number): Pipeline | undefined {
      if(!this.data.length)
        return undefined;
      return this.data.find(item => item.id == pipeline_id)
    }

    findInPipelines(pipelines_id: number[]):Pipeline[] {
      if(!pipelines_id.length) return [];
      if(!this.pipelines.length) return [];

      return this.pipelines.filter(item => pipelines_id.includes(item.id))
    }

  }


  interface IUpdatePipeline {
     account_id: number;
     id: number;
     multiple: boolean;
     name: string;
     sort: number;
  }


  export class Pipeline {
    readonly account_id: number;
    readonly id: number;
    readonly multiple: boolean;
    protected _isCorrect: boolean;
    protected _name: string;
    protected _pipelines_id: number[];
    protected _pipelines: Pipeline[] = []
    protected _sort: number;
    protected  _statuses: Status[] = []
    protected  _statuses_id: number[] = []
    dropStatuses:IDropStatus[] = []

    constructor( model: any ) {
      this.account_id = model.account_id
      this.id = model.id
      this.multiple = model.multiple
      this._isCorrect = model.isCorrect
      this._name = model.name
      this._pipelines_id = model.pipelines_id
      this._sort = model.sort
    }

    joinStatuses(){
      this._statuses = FStagesFabric.self.findByPipline(this.id)
      this._statuses_id = this._statuses.map( st => st.id)
    }

    get model():IPipeline{
      return {
        account_id: this.account_id,
        id: this.id,
        multiple: this.multiple,
        isCorrect: this.isCorrect,
        name: this.name,
        pipelines_id: this.pipelinesId,
        sort: this.sort,
        pipelines: this.pipelines,
        statuses: this.statuses
      }
    }

    get shortModelActive(): IPipelineShort{
      return {
        id: this.id,
        statuses_id: [...this.statusesId]
      }
    }

    get entityShort(): IEntitiesShort{
      return {
        id: this.id,
        name: this.name,
        children: this.statusesShort
      }
    }

    get updateModel(): IUpdatePipeline{
      return {
        multiple: false,
        account_id: this.account_id,
        id: this.id,
        name: this.name,
        sort: this.sort
      }
    }

    get isCorrect(){
      return this._isCorrect
    }

    protected setIsCorrect(newValue: boolean){
      if(newValue == this._isCorrect)
        return;
      this._isCorrect = newValue
    }

    get statuses(){
      return this._statuses
    }

    get statusesShort(): IEntitiesShort[]{
      return this._statuses.map( i => i.entityShort)
    }

    get statusesId(){
      return this._statuses_id
    }

    get pipelines(){
      return this._pipelines
    }

    get pipelinesId(): number[]{
      return this._pipelines_id
    }

    get name(): string{
      return this._name
    }

    get sort(): number{
      return this._sort
    }

    protected addLinks(pipelines_id: number[]){
      this._pipelines_id = [...this._pipelines_id, ...pipelines_id]
    }

    protected deleteLinks(pipelines_id: number[]){
      let newPipelines = this._pipelines_id.filter(id => !pipelines_id.includes(id))
      this._pipelines_id = newPipelines
    }

  }


  export class Segment extends Pipeline{
    static async create(struct: any):Promise<Pipeline>{
      let res = await Segment.fabric.createSegment([struct])
      return res[0]
    }

    private static fabric = FSegmentFabric.self

    constructor(model: any) {
      super(model);
      this.joinLinkedPipelines()
    }

    protected joinLinkedPipelines(){
      if(!this.pipelinesId.length){
        this._pipelines = [];
        return;
      }
      this._pipelines = Segment.fabric.findAll(this.pipelinesId)
    }

    get linkedPipelines(){
      return this._pipelines
    }

    async destroy():Promise<boolean>{
      await Segment.fabric.deleteSegments([this.id])
      return true
    }

    async updateName(name: string){
      this._setName(name)
      await  Segment.fabric.updateSegment([this.updateModel])
    }

    private _setName(name: string){
      this._name = name
    }

    async addLinkedPipelines(pipelines_id: number[]){
      let struct = {segment_id: this.id, pipelines_id}
      await Segment.fabric.addPipelinesToSegment([struct])
      this.addLinks(pipelines_id)
      this._pushNewLiksPipelines(pipelines_id)
    }

    protected addNewLinkedPipelines(pipelines_id: number[]){
      this.addLinks(pipelines_id)
      this._pushNewLiksPipelines(pipelines_id)
    }

    private _pushNewLiksPipelines(pipelines_id: number[]){
      let pips = Segment.fabric.findAll(pipelines_id)
      this._pipelines = [...this._pipelines, ...pips]
    }


    async deleteLinkedPipelines(pipelines_id: number[]){
      let struct = {segment_id: this.id, pipelines_id}
      await Segment.fabric.deletePipelinesFromSegment([struct])
      this.deleteLinks(pipelines_id)
      this.joinLinkedPipelines()
    }

    async checkCorrect(){
      let res = await Segment.fabric.checkCorrectSegments([this.id])
      if(res[0].segment_id == this.id){
        this.setIsCorrect(res[0].isCorrect)
      }
    }

  }

}

