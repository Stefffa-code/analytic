var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as axios from "../../../../core/axios";
import { IEmployeeSpace } from "../../../employees/FEmployeesFabric";
var FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
export class FDepartmentEmployeesFabric {
    constructor() {
        this._baseUrl = 'api/dependencies/employees_to_department';
        this._account_id = 0;
        this._data = [];
    }
    static get self() {
        if (FDepartmentEmployeesFabric._self)
            return FDepartmentEmployeesFabric._self;
        FDepartmentEmployeesFabric._self = new FDepartmentEmployeesFabric();
        return FDepartmentEmployeesFabric._self;
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
    init(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            this._account_id = account_id;
            yield this.getAll();
        });
    }
    getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(this.urlGet, { data: { account_id: this.accountId } });
            this._data = this._createBaseInstance(result);
        });
    }
    _createBaseInstance(data) {
        return data.map(item => new EmployeesLinkBase(item));
    }
    createInstances() {
        this._data = this._data.map(item => new EmployeesLinks(item.department_id));
    }
    createLinks(structs) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(this.urlAdd, { data: structs });
        });
    }
    deleteLinks(structs) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield axios.get(this.urlDelete, { data: structs });
        });
    }
    addDepartmentLinkHandler(data) {
        let finded = this.data.find(i => i.department_id === data.department_id);
        if (!finded) {
            this._data.push(data);
        }
    }
    find(department_id) {
        if (!department_id)
            return;
        return this.data.find(d => d.department_id == department_id);
    }
    findAll(departments_id) {
        if (!departments_id.length)
            return [];
        return this.data.filter(item => departments_id.includes(item.department_id));
    }
}
class EmployeesLinkBase {
    constructor(data) {
        this._employees_id = [];
        if (typeof data == 'number') {
            this.department_id = data;
            this._setEmployeesLinks(data);
        }
        else {
            this.department_id = data.department_id;
            this._employees_id = data.employees_id;
        }
    }
    _setEmployeesLinks(department_id) {
        let link = FDepartmentEmployeesFabric.self.find(department_id);
        if (!link) {
            this._employees_id = [];
            FDepartmentEmployeesFabric.self.addDepartmentLinkHandler(this);
            return;
        }
        this._employees_id = link.employeesId;
    }
    get employeesId() {
        return this._employees_id;
    }
    get departmentId() {
        return this.department_id;
    }
}
export class EmployeesLinks extends EmployeesLinkBase {
    constructor(department) {
        super(department);
        this.fabric = FDepartmentEmployeesFabric.self;
        this._employees = [];
        this._joinEmployees();
    }
    get employees() {
        return this._employees;
    }
    get employeesShort() {
        return this._employees.map(i => {
            return {
                id: i.id,
                name: i.name
            };
        });
    }
    _joinEmployees() {
        if (!this.employeesId)
            return [];
        this._employees = FEmployeesFabric.self.findAll(this.employeesId);
    }
    create(employees_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fabric.createLinks([{
                    department_id: this.departmentId,
                    employees_id: employees_id
                }]);
            this._addEmployees(employees_id);
        });
    }
    _addEmployees(employees_id) {
        let newIds = [...this.employeesId, ...employees_id];
        this._employees_id = newIds;
        let addSEmployees = FEmployeesFabric.self.findAll(employees_id);
        this._employees = [...this._employees, ...addSEmployees];
    }
    destroy(employees_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.fabric.deleteLinks([{
                    department_id: this.departmentId,
                    employees_id: employees_id
                }]);
            this._removeStatuses(employees_id);
        });
    }
    _removeStatuses(employees_id) {
        this._employees_id = this.employeesId.filter(id => !employees_id.includes(id));
        this._employees = this.employees.filter(item => !employees_id.includes(item.id));
    }
}
//# sourceMappingURL=FDepartmentEmployeesFabric.js.map