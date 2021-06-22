var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IVuePipelines } from "./FSegmentFabric";
import { IVueStage } from "./FStageFabric";
var Segment = IVuePipelines.Segment;
import Account from "../../account/Account";
var Stage = IVueStage.Stage;
var FSegmentFabric = IVuePipelines.FSegmentFabric;
import { Emitter } from "../../core/Emitter";
var FStagesFabric = IVueStage.FStagesFabric;
export class ViewSegmentsFabric extends FSegmentFabric {
    constructor() {
        super(...arguments);
        this._viewSegments = [];
    }
    static get inst() {
        if (ViewSegmentsFabric._inst)
            return ViewSegmentsFabric._inst;
        ViewSegmentsFabric._inst = new ViewSegmentsFabric();
        return ViewSegmentsFabric._inst;
    }
    get viewSegments() {
        return this._viewSegments;
    }
    _createViewInstance(models) {
        return models.map(model => new ViewSegment(model));
    }
    init(account_id) {
        const _super = Object.create(null, {
            init: { get: () => super.init }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.init.call(this, account_id);
            this._viewSegments = this._createViewInstance(this.segments.map(s => s.model));
        });
    }
    createViewSegment(structs) {
        const _super = Object.create(null, {
            createSegment: { get: () => super.createSegment }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let segments = yield _super.createSegment.call(this, structs);
            let insts = this._createViewInstance(segments.map(s => s.model));
            this._viewSegments.concat(insts);
            Emitter.self.emit('create_segments', insts);
            return insts;
        });
    }
    deleteViewSegments(segments_id) {
        const _super = Object.create(null, {
            deleteSegments: { get: () => super.deleteSegments }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.deleteSegments.call(this, segments_id);
            let newData = this._viewSegments.filter(segm => !segments_id.includes(segm.id));
            this._viewSegments = newData;
            Emitter.self.emit('delete_segments', segments_id);
            return true;
        });
    }
}
export class ViewSegment extends Segment {
    constructor(model) {
        super(model);
        this._dropPipelines = [];
        this._countsNameStage = 1;
        this._stages = [];
        this._stages_id = [];
        this._addStatusesToStages();
        this._fabricCells = new FabricCells(this.pipelinesId, this.stagesId);
        this._putLinkedStatusesInCells();
        this._dropPipelinesHandler();
        this._dropStatusesHandler();
    }
    static create() {
        return __awaiter(this, void 0, void 0, function* () {
            let account_id = Account.self.accountId();
            let segment = yield ViewSegment.VFabric.createViewSegment([{ account_id }]);
            return new ViewSegment(segment[0].model);
        });
    }
    get stagesId() {
        return this._stages_id;
    }
    get stages() {
        return this._stages;
    }
    get fabricCells() {
        return this._fabricCells;
    }
    _dropPipelinesHandler() {
        let t = this.pipelinesId;
        this._dropPipelines = FSegmentFabric.self.pipelines.map(item => {
            let pipeline = JSON.parse(JSON.stringify(item.model));
            pipeline.isUsed = this.pipelinesId.includes(pipeline.id);
            return pipeline;
        });
    }
    _dropStatusesHandler() {
        let allLinkStatuses = [];
        this.stages.forEach(stage => {
            allLinkStatuses = [...allLinkStatuses, ...stage.statusesId];
        });
        this._pipelines.forEach(pipeline => {
            this._dropStatusesOnePipHandler(pipeline, allLinkStatuses);
        });
    }
    _dropStatusesOnePipHandler(pipeline, allLinkStatuses) {
        pipeline.dropStatuses = pipeline.statuses.map(status => {
            let dropStatus = JSON.parse(JSON.stringify(status.model));
            dropStatus.hide = allLinkStatuses.includes(status.id);
            return dropStatus;
        });
    }
    _createDropStatusePipelines(pipelines_id) {
        let pipelines = this.pipelines.filter(p => pipelines_id.includes(p.id));
        pipelines.forEach(pipeline => {
            pipeline.dropStatuses = pipeline.statuses.map(status => {
                let dropStatus = JSON.parse(JSON.stringify(status.model));
                dropStatus.hide = false;
                return dropStatus;
            });
        });
    }
    _hideStatusesInPiplines(statuses_id, pipeline_id) {
        let pipeline = this.pipelines.find(i => i.id == pipeline_id);
        if (!pipeline)
            return;
        pipeline.dropStatuses.forEach(item => {
            if (statuses_id.includes(item.id)) {
                item.hide = true;
            }
        });
    }
    _showStatusesInPiplines(statuses_id, pipeline_id) {
        if (!pipeline_id) {
            this.pipelines.forEach(pipeline => {
                this._showStatusesInOnePip(statuses_id, pipeline);
            });
            return;
        }
        let pipeline = this.pipelines.find(i => i.id == pipeline_id);
        if (!pipeline)
            return;
        this._showStatusesInOnePip(statuses_id, pipeline);
    }
    _showStatusesInOnePip(statuses_id, pipeline) {
        pipeline.dropStatuses.forEach(item => {
            if (statuses_id.includes(item.id)) {
                item.hide = false;
            }
        });
    }
    get dropPipelines() {
        return this._dropPipelines;
    }
    get unusedPipelines() {
        return this.dropPipelines.filter(i => !i.isUsed);
    }
    _setStatuses(data) {
        this._stages = data;
    }
    _putLinkedStatusesInCells() {
        if (!this.pipelinesId.length || !this.stagesId.length)
            return;
        this.stages.filter(stage => {
            let cellsInStage = this.fabricCells.findStageCells(stage.id);
            cellsInStage.filter(cell => {
                let cellStatuses = stage.linkedStatuses.filter(lSt => lSt.pipeline_id == cell.pipelineId);
                cell.setStatuses(cellStatuses);
            });
        });
    }
    _addStatusesToStages() {
        this._stages = FStagesFabric.self.findByPipline(this.id);
        this._stages_id = this._stages.map(i => i.id);
        this._stages.forEach(item => this._eventStageHandler(item.id));
    }
    addLinkPipelines(pipelines) {
        return __awaiter(this, void 0, void 0, function* () {
            let pipelines_id = pipelines.map(i => i.id);
            let struct = { segment_id: this.id, pipelines_id };
            yield FSegmentFabric.self.addPipelinesToSegment([struct]);
            this.addNewLinkedPipelines(pipelines_id);
            this._fabricCells.addPipelines(pipelines_id);
            this._addUnusedPip(pipelines_id);
            this._createDropStatusePipelines(pipelines.map(i => i.id));
        });
    }
    _addUnusedPip(pipelines_id) {
        this._dropPipelines.forEach(i => {
            if (pipelines_id.includes(i.id)) {
                i.isUsed = true;
            }
        });
    }
    deleteLinkPipelines(pipelines_id) {
        const _super = Object.create(null, {
            deleteLinkedPipelines: { get: () => super.deleteLinkedPipelines }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.deleteLinkedPipelines.call(this, pipelines_id);
            this._fabricCells.deletePipelines(pipelines_id);
            this._deleteUnusedPip(pipelines_id);
        });
    }
    _deleteUnusedPip(pipelines_id) {
        this._dropPipelines.forEach(i => {
            if (pipelines_id.includes(i.id)) {
                i.isUsed = false;
            }
        });
    }
    findCell(pipeline_id, stage_id) {
        return this._fabricCells.find(pipeline_id, stage_id);
    }
    deleteStage(stage_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let stage = this.stages.find(i => i.id == stage_id);
            if (!stage)
                return;
            yield stage.destroy();
            this._showStatusesInPiplines(stage.statusesId);
            this._deleteStageFromSegment(stage.id);
            this._fabricCells.deleteStages([stage.id]);
            let isAllUsed = this._isAllPipelinesStatusesUsed();
            if (!isAllUsed)
                this.setIsCorrect(false);
        });
    }
    _deleteStageFromSegment(stage_id) {
        let newData = this.stages.filter(i => i.id != stage_id);
        this._stages = newData;
    }
    createStage() {
        return __awaiter(this, void 0, void 0, function* () {
            let stage = yield Stage.create(this.id, this._countsNameStage);
            this._countsNameStage++;
            if (stage instanceof Stage) {
                this._stages.push(stage);
                this._fabricCells.addStages([stage.id]);
                this._eventStageHandler(stage.id);
            }
        });
    }
    _eventStageHandler(stage_id) {
        Emitter.self.subscribe(`add_statuses_in_cell-${stage_id}`, (data) => __awaiter(this, void 0, void 0, function* () {
            yield this._addStatusesInCell(data);
        }));
        Emitter.self.subscribe(`delete_statuses_in_cell-${stage_id}`, data => {
            this._deleteStatusesFromCell(data);
        });
    }
    _addStatusesInCell(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!data.statuses_id.length)
                return;
            let stage = FStagesFabric.self.find(data.cell.stageId);
            yield stage.addLinkedStatuses(data.statuses_id);
            this._hideStatusesInPiplines(data.statuses_id, data.cell.pipelineId);
            yield this._checkIsCorrectSegment();
            yield this._isChangeDefaultNameOfStage(stage, data.statuses_id[0]);
        });
    }
    _isChangeDefaultNameOfStage(stage, status_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Stage.defaultNamePattern.test(stage.name))
                return;
            let st = FStagesFabric.self.find(status_id);
            if (!st)
                return;
            yield stage.updateName(st.name);
        });
    }
    _deleteStatusesFromCell(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let stage = FStagesFabric.self.find(data.cell.stageId);
            yield stage.deleteLinkedStatuses(data.statuses_id);
            this._showStatusesInPiplines(data.statuses_id, data.cell.pipelineId);
            this.setIsCorrect(false);
        });
    }
    _checkIsCorrectSegment() {
        return __awaiter(this, void 0, void 0, function* () {
            let isAllUsed = this._isAllPipelinesStatusesUsed();
            if (!isAllUsed)
                return;
            yield this.checkCorrect();
        });
    }
    _isAllPipelinesStatusesUsed() {
        let allUsed = !this.pipelines.find(pipeline => {
            return pipeline.dropStatuses.find(i => !i.hide);
        });
        return allUsed;
    }
}
ViewSegment.VFabric = ViewSegmentsFabric.inst;
class FabricCells {
    constructor(pipelines_id, stages_id) {
        this._cells = [];
        this._stages_id = [];
        this._pipelines_id = [];
        this._addCells(pipelines_id, stages_id);
        this._stages_id = stages_id;
        this._pipelines_id = pipelines_id;
    }
    get pipelinesId() {
        return this._pipelines_id;
    }
    get stagesId() {
        return this._stages_id;
    }
    get cells() {
        return this._cells;
    }
    _addCells(pipelines_id, stages_id) {
        for (let i = 0; i < pipelines_id.length; i++) {
            for (let j = 0; j < stages_id.length; j++) {
                let cell = new Cell({
                    pipeline_id: pipelines_id[i],
                    stage_id: stages_id[j],
                    statuses: []
                });
                this._cells.push(cell);
            }
        }
    }
    addPipelines(pipelines_id) {
        let newPips = this._pipelines_id.concat(pipelines_id);
        this._pipelines_id = newPips;
        this._addCells(pipelines_id, this.stagesId);
    }
    deletePipelines(pipelines_id) {
        this._pipelines_id = this.pipelinesId.filter(i => !pipelines_id.includes(i));
        this._deleteCellsWithPips(pipelines_id);
    }
    _deleteCellsWithPips(pipelines_id) {
        let newCells = this.cells.filter(cell => !pipelines_id.includes(cell.pipelineId));
        this._cells = newCells;
    }
    addStages(stages_id) {
        let newData = this._stages_id.concat(stages_id);
        this._stages_id = newData;
        this._addCells(this.pipelinesId, stages_id);
    }
    deleteStages(stages_id) {
        this._stages_id = this.stagesId.filter(id => !stages_id.includes(id));
        this._deleteCellsWithStage(stages_id);
    }
    _deleteCellsWithStage(stages_id) {
        let newCells = this.cells.filter(cell => !stages_id.includes(cell.stageId));
        this._cells = newCells;
    }
    find(pipeline_id, stage_id) {
        return this.cells.find(cell => cell.stageId == stage_id && cell.pipelineId == pipeline_id);
    }
    findStageCells(stage_id) {
        let res = this.cells.filter(cell => cell.stageId == stage_id);
        return res ? res : [];
    }
    findPipelineCells(pipeline_id) {
        let res = this.cells.filter(cell => cell.pipelineId == pipeline_id);
        return res ? res : [];
    }
}
export class Cell {
    constructor(model) {
        this._statuses = [];
        this._pipeline_id = model.pipeline_id;
        this._stage_id = model.stage_id;
        this._statuses = [];
    }
    get statuses() {
        return this._statuses;
    }
    get pipelineId() {
        return this._pipeline_id;
    }
    get stageId() {
        return this._stage_id;
    }
    setStatuses(statuses) {
        this._statuses = statuses;
    }
    addStatuses(statuses) {
        let newData = this._statuses.concat(statuses);
        this._statuses = newData;
        let eventData = {
            cell: this,
            statuses_id: statuses.map(i => i.id),
        };
        Emitter.self.emit(`add_statuses_in_cell-${this.stageId}`, eventData);
    }
    deleteStatuses(statuses_id) {
        let newData = this.statuses.filter(st => !statuses_id.includes(st.id));
        this._statuses = newData;
        let eventData = {
            cell: this,
            statuses_id: statuses_id,
        };
        Emitter.self.emit(`delete_statuses_in_cell-${this.stageId}`, eventData);
    }
}
//# sourceMappingURL=ViewSegment.js.map