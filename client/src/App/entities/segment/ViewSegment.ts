import {IVuePipelines} from "./FSegmentFabric";
import {IVueStage} from "./FStageFabric";
import Segment = IVuePipelines.Segment;
import Account from "../../account/Account";
import Pipeline = IVuePipelines.Pipeline;
import Stage = IVueStage.Stage;
import Status = IVueStage.Status;
import FSegmentFabric = IVuePipelines.FSegmentFabric;
import {ICommonPipeline} from "../../../../../server/entities/pipelines/pipelines/ICommonSegments";
import ICreateSegment = ICommonPipeline.ICreateSegment;
import {IPipeline, IStatus} from "../../types/types";
import {Emitter} from "../../core/Emitter";
import FStagesFabric = IVueStage.FStagesFabric;





interface ICell{
  pipeline_id: number,
  stage_id: number,
  statuses: Status[]
}

interface IViewSegment  {
  // stages: Stage[]
  // cells: FabricCells

  findCell(pipeline_id: number, stage_id:number)

  addLinkPipelines(pipeline: Pipeline[])
  deleteLinkPipelines(pipeline_id: number[])

  createStage(pipeline_id: number)
  deleteStage(pipeline_id: number)

}

export class ViewSegmentsFabric extends FSegmentFabric{
  private static _inst
  static get inst() {
    if(ViewSegmentsFabric._inst)
      return ViewSegmentsFabric._inst
    ViewSegmentsFabric._inst = new ViewSegmentsFabric()
    return ViewSegmentsFabric._inst
  }

  private  _viewSegments: ViewSegment[] = []

  get viewSegments(): ViewSegment[]{
    return this._viewSegments
  }

  private _createViewInstance(models: IPipeline[]): ViewSegment[]{
    return models.map(model => new ViewSegment(model))
  }

  async init(account_id){
    await super.init(account_id)
    this._viewSegments = this._createViewInstance(this.segments.map(s => s.model))
  }

 async createViewSegment(structs?:ICreateSegment[]): Promise<ViewSegment[]>{
   let segments = await super.createSegment(structs)
   let insts =  this._createViewInstance(segments.map(s => s.model))
   this._viewSegments.concat(insts)
   Emitter.self.emit('create_segments', insts)
   return insts
 }

 async deleteViewSegments(segments_id: number[] ): Promise<boolean> {
  await super.deleteSegments(segments_id)
   let newData = this._viewSegments.filter(segm => !segments_id.includes(segm.id))
   this._viewSegments = newData
   Emitter.self.emit('delete_segments', segments_id)
   return true
 }

}


interface IDropPipeline extends IPipeline{
  isUsed: boolean
}
export interface IDropStatus extends IStatus{
  hide: boolean
}


export class ViewSegment extends Segment implements IViewSegment{
  private static VFabric = ViewSegmentsFabric.inst
  private _dropPipelines:IDropPipeline[] = []

  static async create(){
    let account_id = Account.self.accountId()
    let segment = await ViewSegment.VFabric.createViewSegment([{account_id }])
    return new ViewSegment(segment[0].model)
  }
  private _countsNameStage = 1
  private  _stages: Stage[] = []
  private  _stages_id: number[] = []
  private _fabricCells: FabricCells

  constructor(model: any) {
    super(model);
    this._addStatusesToStages()
    this._fabricCells = new FabricCells(this.pipelinesId, this.stagesId)
    this._putLinkedStatusesInCells()
    this._dropPipelinesHandler()
    this._dropStatusesHandler()
  }


  get stagesId(){
    return this._stages_id
  }

  get stages(): Stage[]{
    return this._stages
  }

  get fabricCells(): FabricCells{
    return this._fabricCells
  }

  private _dropPipelinesHandler(){
    let t  = this.pipelinesId
    this._dropPipelines = FSegmentFabric.self.pipelines.map( item => {
      let pipeline = JSON.parse(JSON.stringify(item.model))
      pipeline.isUsed = this.pipelinesId.includes(pipeline.id)
      return pipeline
    })
  }

  private _dropStatusesHandler(){
    let allLinkStatuses: number[] = []
    this.stages.forEach(stage => {
      allLinkStatuses = [...allLinkStatuses, ...stage.statusesId]
    })

    this._pipelines.forEach(pipeline => {
     this._dropStatusesOnePipHandler(pipeline, allLinkStatuses)
    })
  }

  private  _dropStatusesOnePipHandler(pipeline: Pipeline, allLinkStatuses: number[]){
    pipeline.dropStatuses = pipeline.statuses.map(status => {
      let dropStatus = JSON.parse(JSON.stringify(status.model))
      dropStatus.hide = allLinkStatuses.includes(status.id)
      return dropStatus
    })
  }

  private _createDropStatusePipelines(pipelines_id: number[]){
    let pipelines = this.pipelines.filter(p => pipelines_id.includes(p.id) )
    pipelines.forEach( pipeline => {
      pipeline.dropStatuses = pipeline.statuses.map(status => {
        let dropStatus = JSON.parse(JSON.stringify(status.model))
        dropStatus.hide = false
        return dropStatus
      })
    })
  }

  private _hideStatusesInPiplines(statuses_id: number[], pipeline_id: number ){
    let pipeline:Pipeline | undefined = this.pipelines.find(i => i.id == pipeline_id)
    if(!pipeline) return;
    pipeline.dropStatuses.forEach(item => {
      if(statuses_id.includes(item.id)){
        item.hide = true
      }
    })
  }

  private _showStatusesInPiplines(statuses_id: number[], pipeline_id?: number ){
    if(!pipeline_id){
      this.pipelines.forEach(pipeline => {
        this._showStatusesInOnePip(statuses_id, pipeline)
      })
      return
    }

    let pipeline:Pipeline | undefined = this.pipelines.find(i => i.id == pipeline_id)
    if(!pipeline) return;
    this._showStatusesInOnePip(statuses_id, pipeline)
  }

  private _showStatusesInOnePip(statuses_id: number[], pipeline: Pipeline){
    pipeline.dropStatuses.forEach(item => {
      if(statuses_id.includes(item.id)){
        item.hide = false
      }
    })
  }

  get dropPipelines(){
    return this._dropPipelines
  }

  get unusedPipelines(){
    return this.dropPipelines.filter( i => !i.isUsed)
  }

  private _setStatuses(data: Stage[]){
    this._stages = data
  }

  private _putLinkedStatusesInCells(){
    if(!this.pipelinesId.length  || !this.stagesId.length)
      return;

    this.stages.filter(stage => {
      let cellsInStage = this.fabricCells.findStageCells(stage.id)
      cellsInStage.filter(cell => {
        let cellStatuses = stage.linkedStatuses.filter(lSt => lSt.pipeline_id == cell.pipelineId)
        cell.setStatuses(cellStatuses)
      })
    })
  }

  private _addStatusesToStages(){
    this._stages = FStagesFabric.self.findByPipline(this.id)
    this._stages_id =  this._stages.map(i => i.id)
    this._stages.forEach(item => this._eventStageHandler(item.id))
  }


  async addLinkPipelines(pipelines: Pipeline[]){
    let pipelines_id = pipelines.map( i => i.id)
    let struct = {segment_id: this.id, pipelines_id}
    await FSegmentFabric.self.addPipelinesToSegment([struct])
    this.addNewLinkedPipelines(pipelines_id)
    this._fabricCells.addPipelines(pipelines_id)
    this._addUnusedPip(pipelines_id)
    this._createDropStatusePipelines(pipelines.map(i => i.id))
  }

  private _addUnusedPip(pipelines_id: number[]){
    this._dropPipelines.forEach(i => {
      if(pipelines_id.includes(i.id)){
        i.isUsed = true
      }
    })
  }

  async deleteLinkPipelines(pipelines_id: number[]){
    await super.deleteLinkedPipelines(pipelines_id)
    this._fabricCells.deletePipelines(pipelines_id)
    this._deleteUnusedPip(pipelines_id)
  }

  private _deleteUnusedPip(pipelines_id: number[]){
    this._dropPipelines.forEach(i => {
      if(pipelines_id.includes(i.id)){
        i.isUsed = false
      }
    })
  }

  findCell(pipeline_id: number, stage_id: number): Cell | undefined{
    return this._fabricCells.find(pipeline_id, stage_id )
  }

  async deleteStage(stage_id:number){

    let stage = this.stages.find(i => i.id == stage_id)
    if(!stage) return;
    await stage.destroy()

    this._showStatusesInPiplines(stage.statusesId)

    this._deleteStageFromSegment(stage.id)
    this._fabricCells.deleteStages([stage.id])
    let isAllUsed = this._isAllPipelinesStatusesUsed()

    if(!isAllUsed)
      this.setIsCorrect(false)
  }

  private _deleteStageFromSegment(stage_id: number){
    let newData = this.stages.filter(i => i.id != stage_id)
    this._stages = newData
  }

  async createStage(){
    let stage = await Stage.create( this.id, this._countsNameStage)
    this._countsNameStage++
    if (stage instanceof Stage) {
      this._stages.push(stage)
      this._fabricCells.addStages([stage.id])
      this._eventStageHandler(stage.id)
    }
  }

  private _eventStageHandler(stage_id){
    Emitter.self.subscribe(`add_statuses_in_cell-${stage_id}`, async data => {
      await this._addStatusesInCell(data)
    })

    Emitter.self.subscribe(`delete_statuses_in_cell-${stage_id}`, data => {
      this._deleteStatusesFromCell(data)
    })
  }

  private async _addStatusesInCell( data: eventLinkStatuses ) {
    if(!data.statuses_id.length)
      return;
    let stage = FStagesFabric.self.find(data.cell.stageId)
    await stage.addLinkedStatuses(data.statuses_id)
    this._hideStatusesInPiplines(data.statuses_id, data.cell.pipelineId)
    await this._checkIsCorrectSegment()
    await this._isChangeDefaultNameOfStage(stage, data.statuses_id[0])
  }

  private async _isChangeDefaultNameOfStage(stage: Stage, status_id: number){
    if(!Stage.defaultNamePattern.test(stage.name))
      return;

    let st = FStagesFabric.self.find(status_id)
    if(!st)
      return;
    await stage.updateName(st.name)
  }


  private async _deleteStatusesFromCell( data: eventLinkStatuses ){
    let stage: Stage = FStagesFabric.self.find(data.cell.stageId)
    await stage.deleteLinkedStatuses(data.statuses_id)
    this._showStatusesInPiplines(data.statuses_id, data.cell.pipelineId)
    this.setIsCorrect(false)
  }

  private async _checkIsCorrectSegment(){
    let isAllUsed = this._isAllPipelinesStatusesUsed()
    if(!isAllUsed)
      return;
    await this.checkCorrect()
  }

  private _isAllPipelinesStatusesUsed():boolean{
    let allUsed =  !this.pipelines.find(pipeline => {
      return pipeline.dropStatuses.find(i => !i.hide)
    })

    return allUsed
  }
}


class FabricCells{
  private  _cells: Cell[] = []
  private _stages_id: number[] = []
  private _pipelines_id: number[] = []

  get pipelinesId(): number[]{
    return this._pipelines_id
  }

  get stagesId(): number[]{
    return this._stages_id
  }

  constructor(pipelines_id: number[], stages_id: number[]) {
    this._addCells(pipelines_id, stages_id)
    this._stages_id = stages_id
    this._pipelines_id = pipelines_id
  }

  get cells(): Cell[]{
    return this._cells
  }

  private _addCells(pipelines_id:number[], stages_id: number[]){
    for(let i = 0; i < pipelines_id.length; i++){

      for(let j = 0; j < stages_id.length; j++){
        let cell = new Cell({
          pipeline_id: pipelines_id[i],
          stage_id: stages_id[j],
          statuses: []
        })
        this._cells.push(cell)
      }
    }
  }

  addPipelines(pipelines_id: number[]){
    let newPips = this._pipelines_id.concat(pipelines_id)
    this._pipelines_id = newPips
     this._addCells(pipelines_id, this.stagesId)
  }

  deletePipelines(pipelines_id:number[]){
    this._pipelines_id = this.pipelinesId.filter(i => !pipelines_id.includes(i))
    this._deleteCellsWithPips(pipelines_id)
  }

  private _deleteCellsWithPips(pipelines_id: number[]){
    let newCells = this.cells.filter(cell => !pipelines_id.includes(cell.pipelineId))
    this._cells = newCells
  }

  addStages(stages_id: number[]){
    let newData = this._stages_id.concat(stages_id)
    this._stages_id = newData
    this._addCells(this.pipelinesId, stages_id)
  }

  deleteStages(stages_id:number[]){
    this._stages_id = this.stagesId.filter(id=> !stages_id.includes(id) )
    this._deleteCellsWithStage(stages_id)
  }

  private _deleteCellsWithStage(stages_id: number[]){
    let newCells = this.cells.filter(cell => !stages_id.includes(cell.stageId))
    this._cells = newCells
  }

  find(pipeline_id: number, stage_id: number): Cell | undefined{
    return this.cells.find(cell => cell.stageId == stage_id && cell.pipelineId == pipeline_id)
  }

  findStageCells( stage_id: number): Cell[]{
    let res = this.cells.filter(cell => cell.stageId == stage_id )
    return res ? res : []
  }

  findPipelineCells( pipeline_id: number): Cell[]{
    let res = this.cells.filter(cell => cell.pipelineId == pipeline_id )
    return res ? res : []
  }

}

interface eventLinkStatuses {
  cell: Cell,
  statuses_id: number[],
}


 export class  Cell {
  private _pipeline_id:number
  private _stage_id: number
  private _statuses: Status[] = []

  constructor(model:ICell) {
    this._pipeline_id = model.pipeline_id
    this._stage_id = model.stage_id
    this._statuses = []
  }

  get statuses(): Status[]{
    return this._statuses
  }

  get pipelineId(): number{
    return this._pipeline_id
  }

  get stageId(): number{
    return this._stage_id
  }

  setStatuses(statuses:Status[]){
    this._statuses = statuses
  }

   addStatuses(statuses:Status[]){
     let newData = this._statuses.concat(statuses)
     this._statuses = newData

     let eventData: eventLinkStatuses = {
       cell:this,
       statuses_id: statuses.map(i => i.id),
     }

     Emitter.self.emit(`add_statuses_in_cell-${this.stageId}`, eventData )
   }

  deleteStatuses( statuses_id:number[]){
    let newData = this.statuses.filter(st => !statuses_id.includes(st.id))
    this._statuses = newData

    let eventData: eventLinkStatuses = {
      cell:this,
      statuses_id: statuses_id,
    }

    Emitter.self.emit(`delete_statuses_in_cell-${this.stageId}`,  eventData)
  }

}
