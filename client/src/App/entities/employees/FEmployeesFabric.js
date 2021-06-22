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
export var IEmployeeSpace;
(function (IEmployeeSpace) {
    class FEmployeesFabric {
        constructor() {
            this.baseUrl = '/api/entities/employees';
            this._employees = [];
            this._entities_short = [];
            this._owner = undefined;
        }
        static get self() {
            if (FEmployeesFabric._self)
                return FEmployeesFabric._self;
            FEmployeesFabric._self = new FEmployeesFabric();
            return FEmployeesFabric._self;
        }
        get data() {
            return this._employees;
        }
        get shortEntities() {
            return this._entities_short;
        }
        get employees() {
            return this._employees;
        }
        get owner() {
            return this._owner;
        }
        get urlGet() {
            return this.baseUrl + '/get.all';
        }
        init(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.getAll(account_id);
            });
        }
        getAll(account_id) {
            return __awaiter(this, void 0, void 0, function* () {
                let res = yield axios.update(this.urlGet, { data: { account_id: account_id } });
                if (!res.length)
                    return [];
                this.saveInstances(res);
                this._defineOwner();
                return this._employees;
            });
        }
        saveInstances(res) {
            return res.map(model => {
                let employee = new Employee(model);
                this._employees.push(employee.model);
                this._entities_short.push(employee.entityShort);
            });
        }
        _defineOwner() {
            this._owner = this.employees.find(i => i.access == 'owner');
        }
        find(id) {
            if (!id)
                return;
            return this.employees.find(i => i.id == id);
        }
        findAll(ids) {
            if (!ids)
                return [];
            let finded = this.employees.filter(user => ids.includes(user.id));
            return finded.length ? finded : [];
        }
    }
    IEmployeeSpace.FEmployeesFabric = FEmployeesFabric;
    class Employee {
        constructor(model) {
            this.access = model.access;
            this.confirm_email = model.confirm_email;
            this.email = model.email;
            this.id = model.id;
            this.name = model.name;
            this.phone = model.phone;
        }
        get model() {
            return {
                access: this.access,
                confirm_email: this.confirm_email,
                email: this.email,
                id: this.id,
                name: this.name,
                phone: this.phone,
            };
        }
        get entityShort() {
            return {
                id: this.id,
                name: this.name,
            };
        }
    }
})(IEmployeeSpace || (IEmployeeSpace = {}));
//# sourceMappingURL=FEmployeesFabric.js.map