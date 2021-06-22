var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { IVueStage } from "../../../segment/FStageFabric";
var FStagesFabric = IVueStage.FStagesFabric;
import * as axios from "../../../../core/axios";
export class FDepartmentStatusesFabric {
    constructor() {
        this._baseUrl = '/api/dependencies/status_to_department';
        this._account_id = 0;
        this._data = [];
    }
    static get self() {
        if (FDepartmentStatusesFabric._self)
            return FDepartmentStatusesFabric._self;
        FDepartmentStatusesFabric._self = new FDepartmentStatusesFabric();
        return FDepartmentStatusesFabric._self;
    }
    get data() {
        return this._data;
    }
    get accountId() {
        return this._account_id;
    }
    get baseUrl() {
        return this._baseUrl;
    }
    get urlGet() {
        return this.baseUrl + '/get';
    }
    get urlAdd() {
        return this.baseUrl + '/add';
    }
    get urlDelete() {
        return this.baseUrl + '/delete';
    }
    get urlUpdate() {
        return this.baseUrl + '/update.name';
    }
    init(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            this._account_id = account_id;
            yield this.getAll(account_id);
        });
    }
    getAll(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(this.urlGet, { data: { account_id: this.accountId } });
            this._data = this._createModels(result);
        });
    }
    _createModels(data) {
        return data.map(item => new StatusesLinksBase(item));
    }
    createStatusesInstances() {
        this._data = this._data.map(item => new StatusesLinks(item.department_id));
    }
    addDepartmentLinkHandler(data) {
        let finded = this.data.find(i => i.department_id === data.department_id);
        if (!finded) {
            this._data.push(data);
        }
    }
    createLinks(structs) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(this.urlAdd, { data: {
                    account_id: this.accountId,
                    structs,
                } });
        });
    }
    deleteLinks(structs) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(this.urlDelete, { data: {
                    account_id: this.accountId,
                    structs,
                } });
        });
    }
    updateItemsName(structs) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.get(this.urlDelete, { data: {
                    account_id: this.accountId,
                    structs
                } });
        });
    }
    find(department_id) {
        if (!department_id)
            return;
        return this.data.find(d => d.departmentId == department_id);
    }
    findAll(departments_id) {
        if (!departments_id.length)
            return [];
        return this.data.filter(item => departments_id.includes(item.departmentId));
    }
}
class StatusesLinksBase {
    constructor(data) {
        this._statuses_id = [];
        if (typeof data == 'number') {
            this.department_id = data;
            this._setStatusesLinks(data);
        }
        else {
            this.department_id = data.department_id;
            this._statuses_id = data.statuses_id;
            this._name = data.name;
        }
    }
    _setStatusesLinks(department_id) {
        let link = FDepartmentStatusesFabric.self.find(department_id);
        if (!link) {
            this._statuses_id = [];
            FDepartmentStatusesFabric.self.addDepartmentLinkHandler(this);
            return;
        }
        this._statuses_id = link._statuses_id;
        this._name = link.name;
    }
    get departmentId() {
        return this.department_id;
    }
    get statusesId() {
        return this._statuses_id;
    }
    get name() {
        return this._name;
    }
    get baseModel() {
        return {
            department_id: this.department_id,
            statuses_id: this.statusesId,
            name: this.name
        };
    }
}
export class StatusesLinks extends StatusesLinksBase {
    constructor(department_id) {
        super(department_id);
        this.fabric = FDepartmentStatusesFabric.self;
        this._statuses = [];
        this._department = null;
        this._joinStatuses();
    }
    get statuses() {
        return this._statuses;
    }
    get department() {
        return this._department;
    }
    _joinStatuses() {
        if (!this.statusesId)
            return [];
        this._statuses = FStagesFabric.self.findAll(this.statusesId);
    }
    create(statuses_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fabric.createLinks([{
                    department_id: this.departmentId,
                    statuses_id
                }]);
            this._addStatuses(statuses_id);
        });
    }
    _addStatuses(statuses_id) {
        let newIds = [...this.statusesId, ...statuses_id];
        this._statuses_id = newIds;
        let addStatuses = FStagesFabric.self.findAll(statuses_id);
        this._statuses = [...this._statuses, ...addStatuses];
    }
    destroy(statuses_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fabric.deleteLinks([{
                    department_id: this.departmentId,
                    statuses_id
                }]);
            this._removeStatuses(statuses_id);
        });
    }
    _removeStatuses(statuses_id) {
        this._statuses_id = this.statusesId.filter(id => !statuses_id.includes(id));
        this._statuses = this.statuses.filter(item => !statuses_id.includes(item.id));
    }
}
//# sourceMappingURL=DepartmentStatusesFabric.js.map