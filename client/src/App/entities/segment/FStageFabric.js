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
import { Emitter } from "../../core/Emitter";
export var IVueStage;
(function (IVueStage) {
    class FStagesFabric {
        constructor() {
            this.baseUrl = '/api/entities/statuses';
            this._statuses = [];
        }
        get statuses() {
            return this._statuses;
        }
        get data() {
            return this._statuses;
        }
        _setStatuses(statuses) {
            this._statuses = statuses;
        }
        static get self() {
            if (FStagesFabric._self)
                return FStagesFabric._self;
            FStagesFabric._self = new FStagesFabric();
            return FStagesFabric._self;
        }
        get failStatus() {
            // @ts-ignore
            return this._fail_status.model;
        }
        get successStatus() {
            // @ts-ignore
            return this._success_status.model;
        }
        get urlGet() {
            return this.baseUrl + '/get';
        }
        get urlGetClosed() {
            return this.baseUrl + '/get.closed';
        }
        get urlGetInPipelines() {
            return this.baseUrl + '/get.in.pipelines';
        }
        get urlCreate() {
            return this.baseUrl + '/create';
        }
        get urlUpdate() {
            return this.baseUrl + '/update';
        }
        get urlDestroy() {
            return this.baseUrl + '/delete';
        }
        get urlAddLinks() {
            return this.baseUrl + '/statuses.add';
        }
        get urlDeleteLinks() {
            return this.baseUrl + '/statuses.delete';
        }
        init(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.getAll(account_id);
                yield this._getClosedStatuses();
            });
        }
        getInPipelines(pipelines_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlGetInPipelines, { data: pipelines_id });
                return this._fetshResulHandler(result);
            });
        }
        _fetshResulHandler(result) {
            let statuses = result.filter(p => !p.multiple);
            let statusIns = this._createInstances(statuses);
            this._setStatuses(statusIns);
            let stages = result.filter(p => p.multiple);
            let stageInsts = this._createInstances(stages);
            this._setStatuses(statusIns.concat(stageInsts));
            return this.statuses;
        }
        getAll(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlGet, { data: { account_id } });
                return this._fetshResulHandler(result);
            });
        }
        _getClosedStatuses() {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.get(this.urlGetClosed);
                this._fail_status = new Status(result.fail);
                this._success_status = new Status(result.success);
            });
        }
        createStages(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let createData = this._sanitizeCreateData(structs);
                let result = yield axios.post(this.urlCreate, { data: createData });
                let instances = this._createInstances(result);
                let newdata = [...this._statuses, ...instances];
                this._statuses = newdata;
                return instances;
            });
        }
        _addToStatuses(models) {
            let newData = [...this._statuses, ...models];
            this._setStatuses(newData);
        }
        _sanitizeCreateData(structs) {
            if (!structs.length)
                return [];
            return structs.map(model => {
                if (!model.pipeline_id)
                    throw new Error("Pipeline id not specified!");
                return {
                    pipeline_id: model.pipeline_id,
                    name: model.name || "Этап",
                    color: model.color || "#000000",
                    sort: model.sort || 10,
                };
            });
        }
        _createInstances(models) {
            if (!models.length)
                return [];
            return models.map(model => {
                if (model.multiple)
                    return new Stage(model);
                return new Status(model);
            });
        }
        updateStages(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.update(this.urlUpdate, { data: structs });
                return true;
            });
        }
        deleteStages(stages_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.remove(this.urlDestroy, { data: stages_id });
                this._deleteFromStatuses(stages_id);
                Emitter.self.emit('delete_statuses');
                return true;
            });
        }
        _deleteFromStatuses(statuses_id) {
            let newData = this.statuses.filter(item => !statuses_id.includes(item.id));
            this._setStatuses(newData);
        }
        addLinksStatusesToStage(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.remove(this.urlAddLinks, { data: structs });
                return true;
            });
        }
        deleteLinksStatusesToStage(structs) {
            return __awaiter(this, void 0, void 0, function* () {
                let result = yield axios.remove(this.urlDeleteLinks, { data: structs });
                return true;
            });
        }
        findAll(statuses_id) {
            if (!this.statuses.length)
                return [];
            let res = this.statuses.filter(item => statuses_id.includes(item.id));
            return res;
        }
        find(status_id) {
            if (!this.statuses.length)
                return undefined;
            return this.statuses.find(item => item.id == status_id);
        }
        findByPipline(pipeline_id) {
            if (!this.statuses.length)
                return [];
            return this.statuses.filter(item => item.pipeline_id == pipeline_id);
        }
    }
    IVueStage.FStagesFabric = FStagesFabric;
    class Status {
        constructor(model) {
            this.id = model.id;
            this.multiple = model.multiple;
            this.pipeline_id = model.pipeline_id;
            this._color = model.color;
            this._name = model.name;
            this._sort = model.sort;
            this._statuses_id = model.statuses_id;
        }
        get model() {
            return {
                id: this.id,
                multiple: this.multiple,
                pipeline_id: this.pipeline_id,
                color: this._color,
                name: this.name,
                sort: this.sort,
                statuses_id: this._statuses_id
            };
        }
        get entityShort() {
            return {
                id: this.id,
                name: this.name,
            };
        }
        get statusesId() {
            return this._statuses_id;
        }
        get name() {
            return this._name;
        }
        get sort() {
            return this._sort;
        }
        setName(name) {
            if (!name)
                return;
            this._name = name;
        }
        setColor(color) {
            if (!color)
                return;
            this._color = color;
        }
        addLinks(statuses_id) {
            this._statuses_id = [...this._statuses_id, ...statuses_id];
        }
        deleteLinks(statuses_id) {
            let newStatuses = this._statuses_id.filter(id => !statuses_id.includes(id));
            this._statuses_id = newStatuses;
        }
    }
    IVueStage.Status = Status;
    class Stage extends Status {
        constructor(model) {
            super(model);
            this._linkedStatuses = [];
            this._joinLinkedStatuses();
        }
        static create(segment_id, nameCount) {
            return __awaiter(this, void 0, void 0, function* () {
                let sruct = {
                    pipeline_id: segment_id,
                    name: Stage.defaultName + nameCount
                };
                let res = yield Stage.fabric.createStages([sruct]);
                return res[0];
            });
        }
        get linkedStatuses() {
            return this._linkedStatuses;
        }
        _joinLinkedStatuses() {
            this._linkedStatuses = FStagesFabric.self.findAll(this.statusesId);
        }
        destroy() {
            return __awaiter(this, void 0, void 0, function* () {
                yield Stage.fabric.deleteStages([this.id]);
                return true;
            });
        }
        updateName(name) {
            return __awaiter(this, void 0, void 0, function* () {
                this.setName(name);
                yield Stage.fabric.updateStages([this.model]);
            });
        }
        updateColor(color) {
            return __awaiter(this, void 0, void 0, function* () {
                this.setName(color);
                yield Stage.fabric.updateStages([this.model]);
            });
        }
        addLinkedStatuses(statuses_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let struct = {
                    segment_id: this.pipeline_id,
                    stage_id: this.id,
                    statuses_id
                };
                yield Stage.fabric.addLinksStatusesToStage([struct]);
                this.addLinks(statuses_id);
                yield this._updateSort();
            });
        }
        deleteLinkedStatuses(statuses_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let struct = {
                    segment_id: this.pipeline_id,
                    stage_id: this.id,
                    statuses_id
                };
                yield Stage.fabric.deleteLinksStatusesToStage([struct]);
                this.deleteLinks(statuses_id);
                yield this._updateSort();
            });
        }
        _updateSort() {
            return __awaiter(this, void 0, void 0, function* () {
                let newSort = this._recalculationSort();
                this._setSort(newSort);
                yield Stage.fabric.updateStages([this.model]);
            });
        }
        _setSort(sort) {
            if (sort < 10)
                throw new Error("Sort must be 10 or up");
            this._sort = sort;
        }
        _recalculationSort() {
            let statuses = FStagesFabric.self.findAll(this.statusesId);
            if (!statuses.length)
                return 10;
            return this._getAvg(statuses.map(i => i.sort));
        }
        _getAvg(nums) {
            return Math.round(nums.reduce((a, b) => a + b) / nums.length);
        }
    }
    Stage.fabric = FStagesFabric.self;
    Stage.defaultName = 'Этап-';
    Stage.defaultNamePattern = new RegExp('^Этап-*');
    IVueStage.Stage = Stage;
})(IVueStage || (IVueStage = {}));
//# sourceMappingURL=FStageFabric.js.map