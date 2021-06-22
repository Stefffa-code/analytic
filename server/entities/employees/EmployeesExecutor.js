import { DB, users_db } from "../../../db/utils/ConnectDB";
import { IValidator } from "../../validator/Validator";
var Validator = IValidator.Validator;
import { Dashboard } from "../../Dashboard";
const { Op, fn, col, query, QueryTypes } = require('sequelize');
export class EmployeesExecutor {
    static get self() {
        if (EmployeesExecutor._self)
            return EmployeesExecutor._self;
        EmployeesExecutor._self = new EmployeesExecutor();
        return EmployeesExecutor._self;
    }
    _createInstance(model) {
        return new Employee(model);
    }
    _createModel(model) {
        let employee = new Employee(model);
        return employee.model;
    }
    async getAll(account_id) {
        let res = await Promise.all([
            await this._queryGetEmployees(account_id),
            await this.getOwner(account_id)
        ]);
        let employees = res[0];
        let owner = res[1];
        if (owner)
            employees.push(owner);
        return employees;
    }
    async _queryGetEmployees(account_id) {
        let users = await users_db.query(`
          SELECT users.id, users.name, users.email, users.confirm_email, users.phone,
          permissions.name as access    
          FROM users
          inner join user_to_account as uta on uta.user_id = users.id
          left join accesses 
            on accesses.user_id = uta.user_id 
            and accesses.account_id = uta.account_id 
          left join permissions on permissions.id = accesses.permission_id     
          where uta.account_id = ${account_id} 
        `, {
            nest: true,
            type: QueryTypes.SELECT
        });
        if (!users.length)
            return [];
        return users.map((user) => this._createModel(user));
    }
    async getOwner(account_id) {
        let owner = await users_db.query(`
            select *,  'owner' as access
            from users
            where id = ( SELECT user_id
            FROM ${DB.name_modules}.module_to_account
            WHERE account_id = ${account_id}
            and module_id = ${Dashboard.id}
          )
        `, {
            nest: true,
            raw: true,
            type: QueryTypes.SELECT
        });
        if (!owner.length)
            return;
        return this._createModel(owner);
    }
}
class Employee {
    constructor(model) {
        this.id = model.id;
        this.name = model.name;
        this.email = model.email;
        this.confirm_email = model.confirm_email;
        this.phone = model.phone;
        this.access = model.access;
    }
    get model() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            confirm_email: Validator.toBoolean(this.confirm_email),
            phone: this.phone,
            access: this.access,
        };
    }
}
//# sourceMappingURL=EmployeesExecutor.js.map