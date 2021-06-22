import IStatus = ICommonStatuses.IStatus;
const { Op, query, QueryTypes } = require('sequelize');
import {StageToStatusesSchema, StatusesSchema, StatusesToPipelineSchema} from "../../../../db/models/pragma_crm/index";
import {ICommonStatuses} from "./ICommonStatuses";

import ILinkStatuses = ICommonStatuses .ILinkStatuses;
import ILinkItemStatuses = ICommonStatuses.ILinkItemStatuses;
import ICreateStage = ICommonStatuses.ICreateStage;
import IItemStage = ICommonStatuses.IItemStage;
import {IValidator} from "../../../validator/Validator";
import Validator = IValidator.Validator;
import {crm_db} from "../../../../db/utils/ConnectDB";
import {IServer} from "../../../IServer";
import Errors = IServer.Errors;



export interface IStagesFabric {
    get(account_id: number): Promise<IStatus[]>
    getInPipelines(pipelines_id: number[]): Promise<IStatus[]>
    create(structs: ICreateStage[]): Promise<IItemStage[]>
    update(structs: IItemStage[]): Promise<IItemStage[]>
    deleteStages(stages_id: number[]): Promise<any>

    addLinksStatusesToStage(structs: ILinkStatuses[]): Promise<any>
    deleteLinksStatusesToStage(structs: ILinkStatuses[]): Promise<any>
}


export class BStagesFabric implements IStagesFabric {
    private failStatusSort: number = 11000
    private successStatusSort: number = 10000

    private _failStatus: Status | undefined
    private _successStatus: Status | undefined

    private static inst: BStagesFabric
    static get self(): BStagesFabric {
        if(BStagesFabric.inst) return BStagesFabric.inst
        BStagesFabric.inst = new BStagesFabric()
        return BStagesFabric.inst
    }

    async getClosed(){
        let res = await Promise.all([
            this.failStatus(),
            this.successStatus()
        ])
        return {
            fail: res[0].model,
            success: res[1].model
        }
    }

    async  failStatus(): Promise<Status>{
        if(!this._failStatus){
            this._failStatus = await this._getFailStatus()
        }
        return this._failStatus
    }

    private async _getFailStatus(): Promise<Status>{
        let res = await StatusesSchema.findOne({ where: { sort: this.failStatusSort }, raw:true });
        if(!res)
            Errors.errorDb("statuses with sort 11000 not found");
        return new Status(res)
    }

    async successStatus(): Promise<Status>{
        if(!this._successStatus){
            this._successStatus = await this._getSuccessStatus()
        }
        return this._successStatus
    }

    private async _getSuccessStatus(): Promise<Status>{
        let res = await StatusesSchema.findOne({ where: { sort: this.successStatusSort }, raw: true });
        if(!res)
            Errors.errorDb("statuses with sort 11000 not found");
        return new Status(res)
    }


    async get(account_id: number): Promise<IStatus[]>{
        let selected = await  this._getAllInAccount(account_id)
        await this._joinStatusesToMultiple(selected)
        let res = selected.map(item => item.model)
        return res
    }

    async getInPipelines(pipelines_id: number[]): Promise<IStatus[]>{
        let selected = await  this._getAllInPipelines(pipelines_id)
        await this._joinStatusesToMultiple(selected)
        return selected.map(item => item.model)
    }

    private async _getAllInAccount(account_id: number): Promise<Status[]>{
        let selected = await crm_db.query(`
            SELECT stp.pipeline_id, statuses.*
            FROM statuses_to_pipeline as stp
            left join statuses on statuses.id = stp.status_id  
            WHERE pipeline_id IN (SELECT id
                  FROM pipelines 
                  where account_id = ${account_id} 
                )
        `,{
            raw: true,
            type: QueryTypes.SELECT
        })

        return this._createInstance(selected)
    }

    private _createInstance(models: any[]): Status[]{
        if(!models.length)  return [];
        let filtred = models.filter( (item: any) => ( item.sort != 10000 && item.sort != 11000 ))
        return filtred.map( (item: any) =>  new Status(item))
    }

    private async _getAllInPipelines(pipelines_id: number[]): Promise<Status[]>{
        let selected = await crm_db.query(`
            SELECT stp.pipeline_id, statuses.*
            FROM statuses_to_pipeline as stp
            left join statuses on statuses.id = stp.status_id  
            WHERE pipeline_id in (${pipelines_id})
        `,{
            raw: true,
            type: QueryTypes.SELECT
        })
        return selected.map( (item: any) =>  new Status(item))
    }

    private  async  _joinStatusesToMultiple(models: Status[]): Promise<void>{
        let multiple_ids = this._extractMultipleIds(models)
        if(!multiple_ids.length) return;
        let links = await this._getMultipleLinksItem(multiple_ids)
        models.forEach(status => this._joinLinkedStatuses(status, links) )

    }

    private _extractMultipleIds(statuses:Status[]): number[]{
        return statuses.filter(item => item.multiple).map(i => i.id)
    }

    private async _getMultipleLinksItem(stages_id:number[]):Promise<ILinkItemStatuses[]>{
        return await StageToStatusesSchema.findAll({
            where: { stage_id: { [Op.in]: [...stages_id] } },
            raw: true
        })
    }

    private _joinLinkedStatuses(status:Status, links: ILinkItemStatuses[]): void{
        if(!status.multiple) return;
        let statuses_id = links
            .filter(link => link.stage_id == status.id)
            .map(i => i.status_id)
        status.setLinkedStatuses(statuses_id)
    }

    async create(structs: ICreateStage[]): Promise<IItemStage[]> {
        return await Promise.all(structs.map(model => this._saveOne(model)))
    }

    private async _saveOne(model: ICreateStage): Promise<IStatus>{
        let saved = await  StatusesSchema.create({
            name: model.name,
            sort: model.sort,
            color: model.color,
            multiple: 1
        })

        await this.createLinkStatusToPipeline(model.pipeline_id, saved.dataValues.id )

        let struct = saved.dataValues
        struct.pipeline_id =  model.pipeline_id

        let stage = new Status(struct)

        return stage.model
    }

    async createLinkStatusToPipeline(pipeline_id: number, status_id: number){
        await StatusesToPipelineSchema.create({
            pipeline_id: pipeline_id,
            status_id: status_id
        })
    }

    async update(structs: IItemStage[]): Promise<IItemStage[]> {
        return await Promise.all(structs.map(model => this._updateOne(model)))
    }

    private async _updateOne(model: IItemStage): Promise<IStatus>{
        let m = await StatusesSchema.findByPk(model.id)
        m.name = model.name
        m.color = model.color
        m.sort = model.sort
        let updated =  await m.save()
        let stage =  new Status(updated.dataValues)
        return stage.model
    }

    async deleteStages(stages_id:  number[]): Promise<any> {
        await StatusesSchema.destroy({
            where: { id: { [Op.in]: stages_id } }
        })
        return { message: "Segment statuses deleted!" }
    }


    async addLinksStatusesToStage(structs:  ILinkStatuses[]): Promise<any> {
        return await Promise.all(structs.map(model => this._addOneLink(model)))
    }

    private async _addOneLink(model: ILinkStatuses): Promise<any>{
        return await Promise.all(model.statuses_id.map(  async id => {
             let saved = await StageToStatusesSchema.create({
                segment_id: model.segment_id,
                stage_id: model.stage_id,
                status_id: id
            })
            return saved.dataValues
        }))
    }

    async addONELinkStatusToStage(struct: ILinkItemStatuses ) : Promise<any> {
        let saved = await StageToStatusesSchema.create({
            segment_id: struct.segment_id,
            stage_id: struct.stage_id,
            status_id: struct.status_id
        })
        return saved.dataValues
    }

    async deleteLinksStatusesToStage(structs: ILinkStatuses[]): Promise<any> {
        return await Promise.all(structs.map(model => this._deleteOneLink(model)))
    }

    private async _deleteOneLink(model: ILinkStatuses): Promise<any>{
        await StageToStatusesSchema.destroy({
            where: {
                [Op.and]: [
                    {segment_id: model.segment_id },
                    {stage_id: model.stage_id },
                    {status_id: { [Op.in]: [...model.statuses_id] }},
                ]
            }
        })
        return { message: "Pipelines deleted from pipelines!" }
    }
}



class Status implements IStatus{
    readonly id: number;
    readonly name: string;
    readonly sort: number;
    readonly color: string;
    readonly multiple: boolean;
    _statuses_id: number[] = []
    readonly pipeline_id: number

    constructor( model: any) {
        this.id = model.id
        this.name = model.name
        this.sort = model.sort
        this.color = model.color
        this.multiple = Validator.toBoolean(model.multiple)
        this.pipeline_id = model.pipeline_id || null
    }

    get model(): IStatus{
        return {
            id: this.id,
            name: this.name,
            sort: this.sort,
            color: this.color,
            multiple: this.multiple,
            pipeline_id: this.pipeline_id ,
            statuses_id: this.statusesIds
        }
    }

    get statusesIds(){
        return this._statuses_id
    }

    setLinkedStatuses(ids: number[]){
        this._statuses_id = ids
    }
}