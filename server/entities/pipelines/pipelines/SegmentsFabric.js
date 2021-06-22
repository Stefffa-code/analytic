import { PipelinesSchema, SegmentToPipelineSchema, } from "../../../../db/models/pragma_crm/index";
import { IValidator } from "../../../validator/Validator";
var Validator = IValidator.Validator;
import { crm_db } from "../../../../db/utils/ConnectDB";
import { BStagesFabric } from "../statuses/StatusesFabric";
const { Op, query, QueryTypes } = require('sequelize');
export class BSegmentsFabric {
    static get self() {
        if (BSegmentsFabric.inst)
            return BSegmentsFabric.inst;
        BSegmentsFabric.inst = new BSegmentsFabric();
        return BSegmentsFabric.inst;
    }
    async get(account_id) {
        let selected = await this._getAll(account_id);
        await this._segmentHandler(selected.filter(i => i.multiple));
        return selected.map(i => i.model);
    }
    async getCategorized(account_id) {
        let selected = await this._getAll(account_id);
        return await this._categorizePipelines(selected);
    }
    async _getAll(account_id) {
        let selected = await PipelinesSchema.findAll({
            where: { account_id },
            raw: true
        });
        return selected.map((model) => new Pipeline(model));
    }
    async _categorizePipelines(pipelines) {
        let pips = pipelines.filter(i => !i.multiple);
        let segments = pipelines.filter(i => i.multiple);
        await this._segmentHandler(segments);
        return {
            pipelines: pips.map(i => i.model),
            segments: segments.map(i => i.model)
        };
    }
    async _segmentHandler(segments) {
        if (!segments.length)
            return;
        await this._addLinkedPipelines(segments);
        await this._checkIsCorrectSegment(segments);
        segments.forEach(segment => {
            if (segment.isCorrect && !segment.pipelinesIds.length)
                segment.setIsCorrect(false);
        });
    }
    async _addLinkedPipelines(segments) {
        let links = await this._getSegmentLinks(segments.map(i => i.id));
        segments.forEach(pipeline => this._joinLinkedPipelinesId(pipeline, links));
    }
    async _getSegmentLinks(segments_id) {
        return await SegmentToPipelineSchema.findAll({
            where: { segment_id: { [Op.in]: segments_id } },
            raw: true
        });
    }
    _joinLinkedPipelinesId(segment, links) {
        let pipelines_id = links
            .filter(link => link.segment_id == segment.id)
            .map(i => i.pipeline_id);
        segment.setPipelinesId(pipelines_id);
    }
    async _checkIsCorrectSegment(segments) {
        await Promise.all(segments.map(async (segment) => {
            let isCorrect = await this._isAllStatusesUsedSegment(segment.id);
            // @ts-ignore
            segment.setIsCorrect(isCorrect);
        }));
    }
    async checkCorrectSegments(segments_id) {
        return await Promise.all(segments_id.map(async (segment_id) => {
            let item = { segment_id, isCorrect: false };
            let hasPips = await this._isHasSegmentPipelines(segment_id);
            if (!hasPips) {
                item.isCorrect = false;
                return item;
            }
            item.isCorrect = await this._isAllStatusesUsedSegment(segment_id);
            return item;
        }));
    }
    async _isHasSegmentPipelines(segment_id) {
        let pipelines = await SegmentToPipelineSchema.findAll({
            where: { segment_id },
            raw: true,
        });
        return !!pipelines.length;
    }
    async _isAllStatusesUsedSegment(segment_id) {
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
        return await this._isAllStatusesUsed(notUsedStatuses);
    }
    async _isAllStatusesUsed(mass) {
        let fail = await BStagesFabric.self.failStatus();
        let success = await BStagesFabric.self.successStatus();
        let res = mass.filter(i => (i.status_id != fail.id && i.status_id != success.id));
        return !res.length;
    }
    async createSegments(structs) {
        return await Promise.all(structs.map(model => this._createOne(model)));
    }
    async _createOne(model) {
        let sort = model.sort || 777;
        let saved = await PipelinesSchema.create({
            account_id: model.account_id,
            name: model.name,
            sort: sort,
            multiple: 1
        });
        let segment = new Pipeline(saved.dataValues);
        await this._addClosedStatusToSegment(segment.id);
        return segment.model;
    }
    async _addClosedStatusToSegment(segment_id) {
        let fail = await BStagesFabric.self.failStatus();
        let success = await BStagesFabric.self.successStatus();
        let res = Promise.all([
            await BStagesFabric.self.createLinkStatusToPipeline(segment_id, success.id),
            await BStagesFabric.self.addONELinkStatusToStage({
                segment_id,
                stage_id: success.id,
                status_id: success.id,
            }),
            await BStagesFabric.self.createLinkStatusToPipeline(segment_id, fail.id),
            await BStagesFabric.self.addONELinkStatusToStage({
                segment_id,
                stage_id: fail.id,
                status_id: fail.id,
            })
        ]);
        return res;
    }
    async updateSegment(structs) {
        return await Promise.all(structs.map(model => this._updateOne(model)));
    }
    async _updateOne(model) {
        let m = await PipelinesSchema.findByPk(model.id);
        m.name = model.name;
        m.sort = model.sort;
        let updated = await m.save();
        let stage = new Pipeline(updated.dataValues);
        return stage.modelDb;
    }
    async deleteSegments(segments_id) {
        await PipelinesSchema.destroy({
            where: { id: { [Op.in]: [...segments_id] } }
        });
        return { message: "Segments deleted!" };
    }
    async addPipelinesToSegment(structs) {
        return await Promise.all(structs.map(model => this._addOnePipsToSegm(model)));
    }
    async _addOnePipsToSegm(model) {
        let res = await Promise.all(model.pipelines_id.map(async (pipeline_id) => {
            await SegmentToPipelineSchema.create({
                segment_id: model.segment_id,
                pipeline_id
            });
        }));
        return { message: "Pipelines added to pipelines!", res };
    }
    async deletePipelinesFromSegment(structs) {
        return await Promise.all(structs.map(model => this._deleteOnePipFromSegm(model)));
    }
    async _deleteOnePipFromSegm(model) {
        await SegmentToPipelineSchema.destroy({
            where: {
                [Op.and]: [
                    { segment_id: model.segment_id },
                    { pipeline_id: { [Op.in]: [...model.pipelines_id] } },
                ]
            }
        });
        return { message: "Pipelines deleted from pipelines!" };
    }
}
class Pipeline {
    constructor(model) {
        this._pipelines_id = [];
        this._isCorrect = null;
        this.multiple = Validator.toBoolean(model.multiple);
        this.account_id = model.account_id;
        this.id = model.id;
        this.name = model.name;
        this.sort = model.sort;
    }
    get modelDb() {
        return {
            account_id: this.account_id,
            id: this.id,
            name: this.name,
            sort: this.sort,
            multiple: this.multiple
        };
    }
    get model() {
        return {
            account_id: this.account_id,
            id: this.id,
            name: this.name,
            sort: this.sort,
            multiple: this.multiple,
            pipelines_id: this.pipelinesIds,
            isCorrect: this.isCorrect
        };
    }
    get pipelinesIds() {
        return this._pipelines_id;
    }
    get isCorrect() {
        return this._isCorrect;
    }
    setIsCorrect(isCorrect) {
        this._isCorrect = isCorrect;
    }
    setPipelinesId(pipelines_id) {
        this._pipelines_id = pipelines_id;
    }
}
//# sourceMappingURL=SegmentsFabric.js.map