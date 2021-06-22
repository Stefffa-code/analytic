var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as axios from '../../core/axios';
import { IEmployeeSpace } from "../employees/FEmployeesFabric";
import { ICommonDepartment } from "../../../../../server/entities/department/ICommonDepartment";
import { FDepartmentStatusesFabric, StatusesLinks } from "./dependencies/statuses/DepartmentStatusesFabric";
import { EmployeesLinks, FDepartmentEmployeesFabric } from "./dependencies/employees/FDepartmentEmployeesFabric";
import { Emitter } from "../../core/Emitter";
export var IDepartmentsFabricSpace;
(function (IDepartmentsFabricSpace) {
    var EmployeesFabric = IEmployeeSpace.FEmployeesFabric;
    var BaseDepartment = ICommonDepartment.BaseDepartment;
    var FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
    class FDepartmentsFabric {
        constructor() {
            this.baseUrl = '/api/entities/departments';
            this._departments = [];
        }
        static get self() {
            if (FDepartmentsFabric._self)
                return FDepartmentsFabric._self;
            FDepartmentsFabric._self = new FDepartmentsFabric();
            return FDepartmentsFabric._self;
        }
        get accountId() {
            return this._account_id;
        }
        init(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                this._account_id = account_id;
                yield Promise.all([
                    this.load(account_id),
                    FDepartmentStatusesFabric.self.init(account_id),
                    FDepartmentEmployeesFabric.self.init(account_id)
                ]);
            });
        }
        joinEntities() {
            return __awaiter(this, void 0, void 0, function* () {
                FDepartmentStatusesFabric.self.createStatusesInstances();
                FDepartmentEmployeesFabric.self.createInstances();
                this.departments.forEach(item => item.createLinks());
                yield this.addDefaultDepartment();
            });
        }
        addDefaultDepartment() {
            return __awaiter(this, void 0, void 0, function* () {
                let defaultDepartment = new Department(this, {
                    account_id: this.accountId,
                    id: 0,
                    title: 'Default',
                    employees_id: this.defineUsersInDefaultDepartment(),
                });
                this._departments.push(defaultDepartment);
                yield defaultDepartment.createLinks();
            });
        }
        defineUsersInDefaultDepartment() {
            let employeesId = FEmployeesFabric.self.data.map(i => i.id);
            let usersInDepartments = [];
            this.data.forEach(d => usersInDepartments.push(...d.employeesId));
            let usersInDefaultDepartment = [];
            employeesId.forEach(id => {
                if (!usersInDepartments.includes(id)) {
                    usersInDefaultDepartment.push(id);
                }
            });
            return usersInDefaultDepartment;
        }
        get data() {
            return this._departments;
        }
        get departments() {
            return this._departments;
        }
        get shortModels() {
            return this.departments.map(d => d.short);
        }
        get shortEntities() {
            return this.departments.map(d => d.entityShort);
        }
        setDepartments(departments) {
            this._departments = departments;
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
        get urlDestroy() {
            return this.baseUrl + '/delete';
        }
        create(struct) {
            return __awaiter(this, void 0, void 0, function* () {
                let createData = [];
                if (struct === null || struct === void 0 ? void 0 : struct.length)
                    createData = struct;
                else
                    createData = [{
                            account_id: this.accountId,
                            title: "Название отдела"
                        }];
                const models = yield axios.post(this.urlCreate, { data: [...createData] });
                let departments = this.createInstances(models);
                departments.forEach(i => i.createLinks());
                this.concatDepartment(departments);
                Emitter.self.emit('departments_changed', this.departments);
                return departments;
            });
        }
        concatDepartment(departments) {
            this._departments = [...this._departments, ...departments];
        }
        remove(ids) {
            return __awaiter(this, void 0, void 0, function* () {
                let res = yield axios.remove(this.urlDestroy, { data: [...ids] });
                if (res) {
                    this.deleteDepartment(ids);
                    Emitter.self.emit('departments_changed', this.departments);
                }
            });
        }
        deleteDepartment(ids) {
            let newDep;
            newDep = this._departments.filter(dep => !ids.includes(dep.id));
            this._departments = newDep;
        }
        update(struct) {
            return __awaiter(this, void 0, void 0, function* () {
                yield axios.update(this.urlUpdate, { data: [...struct] });
            });
        }
        load(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                const models = yield axios.get(this.urlGet, { account_id });
                const departments = this.createInstances(models);
                this.setDepartments(departments);
            });
        }
        createInstances(models) {
            return models.map(model => {
                return new Department(this, model);
            });
        }
        findAll(ids) {
            if (!ids.length)
                return [];
            return this._departments.filter(item => ids.includes(item.id));
        }
        find(id) {
            if (!id)
                return;
            return this._departments.find(item => item.id == id);
        }
    }
    IDepartmentsFabricSpace.FDepartmentsFabric = FDepartmentsFabric;
    class Department extends BaseDepartment {
        constructor(fabric, model) {
            super(model);
            this._head = null;
            this._parent_department = null;
            this.statusesLinks = null;
            this.employeesLinks = null;
            this.fabric = fabric;
        }
        get name() {
            return this._title;
        }
        get head() {
            return this._head;
        }
        createLinks() {
            return __awaiter(this, void 0, void 0, function* () {
                this._joinHead();
                this._joinHeadDepartment();
                this.statusesLinks = new StatusesLinks(this.id);
                let data = this.id;
                if (this.id === 0) {
                    data = {
                        department_id: this.id,
                        employees_id: this.employeesIdBase
                    };
                }
                this.employeesLinks = new EmployeesLinks(data);
            });
        }
        _joinHead() {
            let head = EmployeesFabric.self.find(this.headId);
            if (!head)
                return;
            this._head = head;
        }
        _joinHeadDepartment() {
            // let headDepartment = FDepartmentsFabric.self.findOne(this.parentDepartmentId)
            // if(!headDepartment) return;
            // this.setHeadDepartment(headDepartment)
        }
        get baseModel() {
            return {
                account_id: this.account_id,
                id: this.id,
                title: this.title,
                head_id: this._head_id,
                parent_department_id: this._parent_department_id,
                employees_id: this.employeesId
            };
        }
        get short() {
            return {
                id: this.id,
                users_id: this.employeesId,
                statuses_id: this.statusesId
            };
        }
        get entityShort() {
            return {
                id: this.id,
                name: this.name,
                children: this.employeesShort
            };
        }
        get model() {
            return {
                account_id: this.account_id,
                id: this.id,
                name: this.title,
                head: this.head,
                parent_department_id: this._parent_department_id,
                employees_id: this.employeesId,
                employees: this.employees,
                statuses: this.statuses,
                statuses_id: this.statusesId
            };
        }
        changeTitle(title) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!title)
                    return;
                this._title = title;
                yield this.fabric.update([this.baseModel]);
            });
        }
        changeHead(employee_id) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!employee_id) {
                    this._head_id = null;
                    this._head = undefined;
                }
                else {
                    this._head_id = employee_id;
                    this._joinHead();
                }
                yield this.fabric.update([this.baseModel]);
            });
        }
        changeHeadDepartment(department_id) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!department_id) {
                    this._parent_department_id = null;
                    this._parent_department = null;
                }
                else {
                    this._parent_department_id = department_id;
                    this._joinHeadDepartment();
                }
                yield this.fabric.update([this.baseModel]);
            });
        }
        get statuses() {
            if (!this.statusesLinks) {
                throw Error('statusesLinks object not created');
            }
            return this.statusesLinks.statuses;
        }
        get statusesId() {
            if (!this.statusesLinks) {
                throw Error('statusesLinks object not created');
            }
            return this.statusesLinks.statusesId;
        }
        createStatusesLinks(statuses_id) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                yield ((_a = this.statusesLinks) === null || _a === void 0 ? void 0 : _a.create(statuses_id));
            });
        }
        deleteStatusesLinks(statuses_id) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                yield ((_a = this.statusesLinks) === null || _a === void 0 ? void 0 : _a.destroy(statuses_id));
            });
        }
        get employees() {
            if (!this.employeesLinks) {
                throw Error('employeesLinks object not created');
            }
            return this.employeesLinks.employees;
        }
        get employeesShort() {
            if (!this.employeesLinks) {
                throw Error('employeesLinks object not created');
            }
            return this.employeesLinks.employeesShort;
        }
        get employeesId() {
            if (!this.employeesLinks) {
                throw Error('employeesLinks object not created');
            }
            return this.employeesLinks.employeesId;
        }
        createEmployeesLinks(employees_id) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!employees_id.length)
                    return;
                yield ((_a = this.employeesLinks) === null || _a === void 0 ? void 0 : _a.create(employees_id));
            });
        }
        deleteEmployeesLinks(employees_id) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                if (!employees_id.length)
                    return;
                yield ((_a = this.employeesLinks) === null || _a === void 0 ? void 0 : _a.destroy(employees_id));
            });
        }
    }
    IDepartmentsFabricSpace.Department = Department;
})(IDepartmentsFabricSpace || (IDepartmentsFabricSpace = {}));
//# sourceMappingURL=FDepartmentsFabric.js.map