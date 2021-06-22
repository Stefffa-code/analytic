import { UserToDepartmentsSchema } from "../../../../db/models/pragma_users/index";
import { users_db } from "../../../../db/utils/ConnectDB";
const { Op, query, QueryTypes } = require('sequelize');
export class BDepartmentUsersFabric {
    static get self() {
        if (BDepartmentUsersFabric._self)
            return BDepartmentUsersFabric._self;
        BDepartmentUsersFabric._self = new BDepartmentUsersFabric();
        return BDepartmentUsersFabric._self;
    }
    async getAll(account_id) {
        let res = await users_db.query(`SELECT * 
            FROM user_to_departments
            where department_id in ( SELECT id
                           from departments
                           where departments.account_id = ${account_id})
        `, {
            nest: true,
            type: QueryTypes.SELECT
        });
        if (!res)
            return [];
        return this._shapeToChangeUTD(res);
    }
    _shapeToChangeUTD(data) {
        let uniqDepartmentIds = new Set(data.map(i => i.department_id));
        let result = [];
        for (let department_id of uniqDepartmentIds) {
            let items = data.filter(i => i.department_id === department_id);
            result.push({
                department_id,
                employees_id: items.map(i => i.user_id)
            });
        }
        return result;
    }
    async createLinks(structs) {
        return await Promise.all(structs.map(item => this._addStruct(item)));
    }
    async _addStruct(struct) {
        return await Promise.all(struct.employees_id.map(user_id => {
            UserToDepartmentsSchema.create({
                department_id: struct.department_id,
                user_id,
            });
        }));
    }
    async destroyLinks(structs) {
        return await Promise.all(structs.map(struct => this._destroyStruct(struct)));
    }
    async _destroyStruct(struct) {
        return await UserToDepartmentsSchema.destroy({
            where: { [Op.and]: [
                    { department_id: struct.department_id },
                    { user_id: { [Op.in]: [...struct.employees_id] }, }
                ] }
        });
    }
}
//# sourceMappingURL=BDepartmentUsersFabric.js.map