import { DepartmentsSchema } from "../../../db/models/pragma_users/index";
import { ICommonDepartment, } from "./ICommonDepartment";
const { Op, query, QueryTypes } = require('sequelize');
export var IBDepartmentsFabric;
(function (IBDepartmentsFabric) {
    var BaseDepartment = ICommonDepartment.BaseDepartment;
    class BDepartmentsFabric {
        static get self() {
            if (BDepartmentsFabric.inst)
                return BDepartmentsFabric.inst;
            BDepartmentsFabric.inst = new BDepartmentsFabric();
            return BDepartmentsFabric.inst;
        }
        async getAll(account_id) {
            return await DepartmentsSchema.findAll({
                where: { account_id },
                raw: true,
            });
        }
        async create(struct) {
            return await Promise.all(struct.map(model => this._saveOne(model)));
        }
        async _saveOne(model) {
            let saved = await DepartmentsSchema.create({
                title: model.title,
                account_id: model.account_id
            });
            saved.dataValues.users_id = [];
            let depart = new Department(this, saved.dataValues);
            return depart.baseModel;
        }
        async update(struct) {
            return await Promise.all(struct.map(model => this._updateOne(model)));
        }
        async _updateOne(model) {
            let m = await DepartmentsSchema.findByPk(model.id);
            m.title = model.title;
            m.head_id = model.head_id;
            m.parent_department_id = model.parent_department_id;
            let updated = await m.save();
            let depart = new Department(this, updated.dataValues);
            return depart.baseModel;
        }
        async remove(ids) {
            await Promise.all(ids.map(id => this._removeOne(id)));
            return { message: 'Departments removed' };
        }
        async _removeOne(id) {
            let model = await DepartmentsSchema.findByPk(id);
            await model.destroy();
        }
    }
    IBDepartmentsFabric.BDepartmentsFabric = BDepartmentsFabric;
    class Department extends BaseDepartment {
        constructor(fabric, model) {
            super(model);
            this.fabric = fabric;
        }
        get baseModel() {
            return {
                account_id: this.account_id,
                id: this.id,
                title: this._title,
                head_id: this._head_id,
                parent_department_id: this._parent_department_id,
                employees_id: this._employees_id
            };
        }
    }
})(IBDepartmentsFabric || (IBDepartmentsFabric = {}));
//# sourceMappingURL=DepartmentsFabric.js.map