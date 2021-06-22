var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as axios from "../../core/axios";
import { IVueStage } from "./FStageFabric";
import Account from "../../account/Account";
export var IVuePipelines;
(function (IVuePipelines) {
    var FStagesFabric = IVueStage.FStagesFabric;
    class FSegmentFabric {
        constructor() {
            this.baseUrl = '/api/entities/pipelines';
            this._loadData = [];
        }
        static get self() {
            if (FSegmentFabric._self)
                return FSegmentFabric._self;
            FSegmentFabric._self = new FSegmentFabric();
            return FSegmentFabric._self;
        }
        get data() {
            return this._loadData;
        }
        get segments() {
            return this._loadData.filter(i => i.multiple);
        }
        get pipelines() {
            return this._loadData.filter(i => !i.multiple);
        }
        get shortModelsActive() {
            return this.pipelines.map(pip => pip.shortModelActive);
        }
        get shortEntities() {
            return this.pipelines.map(pip => pip.entityShort);
        }
        _setData(data) {
            this._loadData = data;
        }
        get urlGet() {
            return this.baseUrl + '/get';
        }
        get urlCreate() {
            return this.baseUrl + '/create';
        }
        get urlUpdate() {
            return this.baseUrl + '/update';
        }
        get urlDelete() {
            return this.baseUrl + '/delete';
        }
        get urlAddLinks() {
            return this.baseUrl + '/pipelines.add';
        }
        get urlDeleteLinks() {
            return this.baseUrl + '/pipelines.delete';
        }
        get urlCheckSegments() {
            return this.baseUrl + '/check.segments';
        }
        init(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.getData(account_id);
            });
        }
        joinStatuses() {
            this.pipelines.forEach(item => item.joinStatuses());
        }
        getData(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlGet, { data: { account_id } });
                let pipelines = result.filter(p => !p.multiple);
                let pipInsts = this._createInstance(pipelines);
                this._setData(pipInsts);
                let segment = result.filter(p => p.multiple);
                let segmentInst = this._createInstance(segment);
                this._setData(pipInsts.concat(segmentInst));
            });
        }
        createSegment(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let createData = this._sanitizeCreateData(structs);
                let result = yield axios.get(this.urlCreate, { data: createData });
                let instances = this._createInstance(result);
                this._addToData(instances);
                return instances;
            });
        }
        _addToData(models) {
            let newData = [...this._loadData, ...models];
            this._setData(newData);
        }
        _sanitizeCreateData(structs) {
            if (!structs) {
                return [{
                        account_id: Number(Account.self.accountId),
                        name: "Группа воронок",
                        sort: 77,
                    }];
            }
            return structs.map(model => {
                if (!model.account_id)
                    throw new Error("Account id not specified!");
                return {
                    account_id: Number(Account.self.accountId),
                    name: model.name || "Группа воронок",
                    sort: model.sort || 77,
                };
            });
        }
        _createInstance(models) {
            if (!models.length)
                return [];
            return models.map(model => {
                if (model.multiple)
                    return new Segment(model);
                return new Pipeline(model);
            });
        }
        updateSegment(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlUpdate, { data: structs });
                return true;
            });
        }
        deleteSegments(segments_id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield axios.get(this.urlDelete, { data: segments_id });
                this._deleteFromData(segments_id);
                return true;
            });
        }
        _deleteFromData(sements_id) {
            let newData = this.data.filter(item => !sements_id.includes(item.id));
            this._setData(newData);
        }
        addPipelinesToSegment(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlAddLinks, { data: structs });
                return true;
            });
        }
        deletePipelinesFromSegment(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlDeleteLinks, { data: structs });
                return true;
            });
        }
        checkCorrectSegments(segments_id) {
            return __awaiter(this, void 0, void 0, function* () {
                return yield axios.get(this.urlCheckSegments, { data: segments_id });
            });
        }
        findAll(pipelines_id) {
            if (!this.data.length)
                return [];
            return this.data.filter(item => pipelines_id.includes(item.id));
        }
        find(pipeline_id) {
            if (!this.data.length)
                return undefined;
            return this.data.find(item => item.id == pipeline_id);
        }
        findInPipelines(pipelines_id) {
            if (!pipelines_id.length)
                return [];
            if (!this.pipelines.length)
                return [];
            return this.pipelines.filter(item => pipelines_id.includes(item.id));
        }
    }
    IVuePipelines.FSegmentFabric = FSegmentFabric;
    class Pipeline {
        constructor(model) {
            this._pipelines = [];
            this._statuses = [];
            this._statuses_id = [];
            this.dropStatuses = [];
            this.account_id = model.account_id;
            this.id = model.id;
            this.multiple = model.multiple;
            this._isCorrect = model.isCorrect;
            this._name = model.name;
            this._pipelines_id = model.pipelines_id;
            this._sort = model.sort;
        }
        joinStatuses() {
            this._statuses = FStagesFabric.self.findByPipline(this.id);
            this._statuses_id = this._statuses.map(st => st.id);
        }
        get model() {
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
            };
        }
        get shortModelActive() {
            return {
                id: this.id,
                statuses_id: [...this.statusesId]
            };
        }
        get entityShort() {
            return {
                id: this.id,
                name: this.name,
                children: this.statusesShort
            };
        }
        get updateModel() {
            return {
                multiple: false,
                account_id: this.account_id,
                id: this.id,
                name: this.name,
                sort: this.sort
            };
        }
        get isCorrect() {
            return this._isCorrect;
        }
        setIsCorrect(newValue) {
            if (newValue == this._isCorrect)
                return;
            this._isCorrect = newValue;
        }
        get statuses() {
            return this._statuses;
        }
        get statusesShort() {
            return this._statuses.map(i => i.entityShort);
        }
        get statusesId() {
            return this._statuses_id;
        }
        get pipelines() {
            return this._pipelines;
        }
        get pipelinesId() {
            return this._pipelines_id;
        }
        get name() {
            return this._name;
        }
        get sort() {
            return this._sort;
        }
        addLinks(pipelines_id) {
            this._pipelines_id = [...this._pipelines_id, ...pipelines_id];
        }
        deleteLinks(pipelines_id) {
            let newPipelines = this._pipelines_id.filter(id => !pipelines_id.includes(id));
            this._pipelines_id = newPipelines;
        }
    }
    IVuePipelines.Pipeline = Pipeline;
    class Segment extends Pipeline {
        constructor(model) {
            super(model);
            this.joinLinkedPipelines();
        }
        static create(struct) {
            return __awaiter(this, void 0, void 0, function* () {
                let res = yield Segment.fabric.createSegment([struct]);
                return res[0];
            });
        }
        joinLinkedPipelines() {
            if (!this.pipelinesId.length) {
                this._pipelines = [];
                return;
            }
            this._pipelines = Segment.fabric.findAll(this.pipelinesId);
        }
        get linkedPipelines() {
            return this._pipelines;
        }
        destroy() {
            return __awaiter(this, void 0, void 0, function* () {
                yield Segment.fabric.deleteSegments([this.id]);
                return true;
            });
        }
        updateName(name) {
            return __awaiter(this, void 0, void 0, function* () {
                this._setName(name);
                yield Segment.fabric.updateSegment([this.updateModel]);
            });
        }
        _setName(name) {
            this._name = name;
        }
        addLinkedPipelines(pipelines_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let struct = { segment_id: this.id, pipelines_id };
                yield Segment.fabric.addPipelinesToSegment([struct]);
                this.addLinks(pipelines_id);
                this._pushNewLiksPipelines(pipelines_id);
            });
        }
        addNewLinkedPipelines(pipelines_id) {
            this.addLinks(pipelines_id);
            this._pushNewLiksPipelines(pipelines_id);
        }
        _pushNewLiksPipelines(pipelines_id) {
            let pips = Segment.fabric.findAll(pipelines_id);
            this._pipelines = [...this._pipelines, ...pips];
        }
        deleteLinkedPipelines(pipelines_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let struct = { segment_id: this.id, pipelines_id };
                yield Segment.fabric.deletePipelinesFromSegment([struct]);
                this.deleteLinks(pipelines_id);
                this.joinLinkedPipelines();
            });
        }
        checkCorrect() {
            return __awaiter(this, void 0, void 0, function* () {
                let res = yield Segment.fabric.checkCorrectSegments([this.id]);
                if (res[0].segment_id == this.id) {
                    this.setIsCorrect(res[0].isCorrect);
                }
            });
        }
    }
    Segment.fabric = FSegmentFabric.self;
    IVuePipelines.Segment = Segment;
})(IVuePipelines || (IVuePipelines = {}));
//# sourceMappingURL=FSegmentFabric.js.map