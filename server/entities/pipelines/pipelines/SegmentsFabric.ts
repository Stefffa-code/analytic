import {ICommonPipeline} from "./ICommonSegments";
import ICreateSegment = ICommonPipeline.ICreateSegment;
import IItemPipeline = ICommonPipeline.IItemPipeline;
import {
    PipelinesSchema,
    SegmentToPipelineSchema,
    StatusesToPipelineSchema,
} from "../../../../db/models/pragma_crm/index";
import ILinkSegmentToPipeline = ICommonPipeline.ILinkSegmentToPipeline;
import {IValidator} from "../../../validator/Validator";
import Validator = IValidator.Validator;
import ILinkItemSegment = ICommonPipeline.ILinkItemSegment;
import IPipeline = ICommonPipeline.IPipeline;
import ICategorizedPipelines = ICommonPipeline.ICategorizedPipelines;
import {crm_db} from "../../../../db/utils/ConnectDB";
import {BStagesFabric} from "../statuses/StatusesFabric";
import ICorrectSegment = ICommonPipeline.ICorrectSegment;
const { Op, query, QueryTypes } = require('sequelize');




export interface IPipelinesFabric {
    getCategorized(account_id: number): Promise<ICategorizedPipelines>
    createSegments(structs:  ICreateSegment[]): Promise<IItemPipeline[]>
    updateSegment(structs:  IItemPipeline[]): Promise<IItemPipeline[]>
    deleteSegments(segments_id: number[] ): Promise<any>

    addPipelinesToSegment(structs: ILinkSegmentToPipeline[]): Promise<any>
    deletePipelinesFromSegment(structs: ILinkSegmentToPipeline[]): Promise<any>
}


export class BSegmentsFabric implements IPipelinesFabric {
    private static inst: BSegmentsFabric
    static get self(): BSegmentsFabric {
        if(BSegmentsFabric.inst) return BSegmentsFabric.inst
        BSegmentsFabric.inst = new BSegmentsFabric()
        return BSegmentsFabric.inst
    }

    async get(account_id: number): Promise<IPipeline[]>{
        let selected =  await this._getAll(account_id)
        await this._segmentHandler(selected.filter(i => i.multiple))
        return selected.map(i => i.model)
    }

    async getCategorized(account_id: number): Promise<ICategorizedPipelines>{
        let selected =  await this._getAll(account_id)
        return await this._categorizePipelines(selected)
    }

    private async _getAll(account_id: number): Promise<Pipeline[]>{
        let selected =  await PipelinesSchema.findAll({
            where: {account_id },
            raw: true
        })
        return selected.map( (model: any) => new Pipeline(model) )
    }

    private async _categorizePipelines(pipelines: Pipeline[] ): Promise<ICategorizedPipelines> {
        let pips = pipelines.filter(i => !i.multiple)
        let segments = pipelines.filter(i => i.multiple)

        await this._segmentHandler(segments)

        return {
            pipelines: pips.map(i => i.model),
            segments: segments.map(i => i.model)
        }
    }

    private async _segmentHandler(segments: Pipeline[]): Promise<void>{
        if(!segments.length)
            return;
        await this._addLinkedPipelines(segments)
        await this._checkIsCorrectSegment(segments)
        segments.forEach( segment => {
            if(segment.isCorrect && !segment.pipelinesIds.length)
                segment.setIsCorrect(false)
        })
    }

    private async  _addLinkedPipelines(segments: Pipeline[]): Promise<void>{
        let links = await this._getSegmentLinks(segments.map(i => i.id))
        segments.forEach(pipeline => this._joinLinkedPipelinesId(pipeline, links) )
    }

    private async _getSegmentLinks(segments_id:number[]):Promise<ILinkItemSegment[]>{
        return  await SegmentToPipelineSchema.findAll({
            where: { segment_id: { [Op.in]: segments_id } },
            raw: true
        })
    }

    private _joinLinkedPipelinesId(segment:Pipeline, links: ILinkItemSegment[]): void{
        let pipelines_id = links
            .filter(link => link.segment_id == segment.id)
            .map(i => i.pipeline_id)
        segment.setPipelinesId(pipelines_id)
    }

    private async _checkIsCorrectSegment(segments:Pipeline[] ): Promise<void>{
        await Promise.all(segments.map( async segment => {
            let isCorrect = await this._isAllStatusesUsedSegment(segment.id)
            // @ts-ignore
            segment.setIsCorrect(isCorrect)
        }))
    }

    async checkCorrectSegments(segments_id: number[]): Promise<ICorrectSegment[]>{
        return await Promise.all(segments_id.map( async segment_id => {
            let item = {   segment_id, isCorrect: false }
            let hasPips = await this._isHasSegmentPipelines(segment_id)
            if(!hasPips){
                item.isCorrect = false;
                return item
            }
            item.isCorrect = await this._isAllStatusesUsedSegment(segment_id)
            return item
        }))
    }


    private async _isHasSegmentPipelines(segment_id: number): Promise<boolean>{
        let pipelines = await SegmentToPipelineSchema.findAll( {
            where:{ segment_id},
            raw: true,
        })
        return !!pipelines.length
    }



    private async _isAllStatusesUsedSegment(segment_id: number):Promise<boolean>{
        let notUsedStatuses = await crm_db.query(`
            SELECT distinct status_tp.status_id
            FROM segment_to_pipeline as segment_tp
            left join statuses_to_pipeline as status_tp on segment_tp.pipeline_id =  status_tp.pipeline_id
            where segment_id = ${segment_id} 
            AND status_tp.status_id 
                NOT IN (SELECT status_id
                  FROM stages_to_statuses as sts
                  where segment_id = ${segment_id} 
                )
      `, {
            nest: true,
            type: QueryTypes.SELECT
        });
        return await this._isAllStatusesUsed(notUsedStatuses)
    }

    private async _isAllStatusesUsed (mass: any[]): Promise<boolean>  {
        let fail = await BStagesFabric.self.failStatus()
        let success = await BStagesFabric.self.successStatus()
        let res = mass.filter(i => (i.status_id != fail.id && i.status_id != success.id ) )
        return !res.length
    }


    async createSegments(structs: ICommonPipeline.ICreateSegment[]): Promise<IPipeline[]> {
        return await Promise.all(structs.map(model => this._createOne(model)))
    }

    private async _createOne(model: ICreateSegment): Promise<IPipeline>{
        let sort = model.sort || 777
        let saved = await  PipelinesSchema.create({
            account_id: model.account_id,
            name: model.name,
            sort: sort,
            multiple: 1
        })
        let segment = new Pipeline(saved.dataValues)
        await this._addClosedStatusToSegment(segment.id)
        return segment.model
    }

    private async _addClosedStatusToSegment(segment_id: number): Promise<any> {
        let fail = await BStagesFabric.self.failStatus()
        let success = await BStagesFabric.self.successStatus()

        let res = Promise.all( [
            await BStagesFabric.self.createLinkStatusToPipeline(segment_id, success.id ),
            await BStagesFabric.self.addONELinkStatusToStage({
                segment_id,
                stage_id:success.id,
                status_id: success.id,
            }),

            await BStagesFabric.self.createLinkStatusToPipeline(segment_id, fail.id ) ,
            await BStagesFabric.self.addONELinkStatusToStage({
                segment_id,
                stage_id:fail.id,
                status_id: fail.id,
            })
        ])
        return res
    }

    async updateSegment(structs: IItemPipeline[]): Promise<IItemPipeline[]> {
        return await Promise.all(structs.map(model => this._updateOne(model)))
    }

    private async _updateOne(model: IItemPipeline): Promise<IItemPipeline>{
        let m = await PipelinesSchema.findByPk(model.id)
        m.name = model.name
        m.sort = model.sort
        let updated =  await m.save()
        let stage =  new Pipeline(updated.dataValues)
        return stage.modelDb
    }

    async deleteSegments(segments_id: number[]): Promise<any> {
        await PipelinesSchema.destroy({
            where: { id: { [Op.in]: [...segments_id] } }
        })
        return { message: "Segments deleted!" }
    }


    async addPipelinesToSegment(structs: ILinkSegmentToPipeline[]): Promise<any> {
        return await Promise.all(structs.map(model => this._addOnePipsToSegm(model)))
    }
    private async _addOnePipsToSegm(model: ILinkSegmentToPipeline): Promise<any>{
        let res = await Promise.all(model.pipelines_id.map( async pipeline_id => {
            await SegmentToPipelineSchema.create({
                segment_id: model.segment_id,
                pipeline_id
            })
        }))
        return { message: "Pipelines added to pipelines!", res }
    }

    async deletePipelinesFromSegment(structs: ILinkSegmentToPipeline[]): Promise<any> {
        return await Promise.all(structs.map(model => this._deleteOnePipFromSegm(model)))
    }

    private async _deleteOnePipFromSegm(model: ILinkSegmentToPipeline): Promise<any>{
        await SegmentToPipelineSchema.destroy({
            where: {
                [Op.and]: [
                    {segment_id: model.segment_id },
                    {pipeline_id: { [Op.in]: [...model.pipelines_id] }},
                ]
            }
        })
        return { message: "Pipelines deleted from pipelines!" }
    }
}



class Pipeline implements IItemPipeline{
    readonly account_id: number;
    readonly id: number;
    readonly name: string;
    readonly sort: number;
    readonly multiple: boolean
    private _pipelines_id: number[] = []
    private _isCorrect: boolean | null = null

    constructor(model: any) {
        this.multiple = Validator.toBoolean(model.multiple)
        this.account_id = model.account_id
        this.id = model.id
        this.name = model.name
        this.sort = model.sort
    }

    get modelDb(): IItemPipeline{
        return {
            account_id: this.account_id,
            id: this.id,
            name: this.name,
            sort: this.sort,
            multiple: this.multiple
        }
    }

    get model(): IPipeline{
        return {
            account_id: this.account_id,
            id: this.id,
            name: this.name,
            sort: this.sort,
            multiple: this.multiple,
            pipelines_id: this.pipelinesIds,
            isCorrect: this.isCorrect
        }
    }

    get pipelinesIds(){
        return this._pipelines_id
    }

    get isCorrect(){
        return this._isCorrect
    }

    setIsCorrect(isCorrect: boolean): void {
        this._isCorrect = isCorrect
    }

    setPipelinesId(pipelines_id:number[]): void {
        this._pipelines_id = pipelines_id
    }
}
