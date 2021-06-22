import { StatusToDepartmentSchema } from "../../../../db/models/pragma_kpi/index";
const { Op, query, QueryTypes } = require('sequelize');
export class BStatusesToDepartmentFabric {
    static get self() {
        if (BStatusesToDepartmentFabric._self)
            return BStatusesToDepartmentFabric._self;
        BStatusesToDepartmentFabric._self = new BStatusesToDepartmentFabric();
        return BStatusesToDepartmentFabric._self;
    }
    async getAll(account_id) {
        let res = await StatusToDepartmentSchema.findAll({ where: { account_id } });
        return this._shapingToChangesSTDArr(res);
    }
    _shapingToChangesSTDArr(data) {
        let dep = data.map((d) => d.department_id);
        let uniqDepartments = [...new Set(dep)];
        return uniqDepartments.map(department_id => {
            return {
                account_id: data[0].account_id,
                department_id: department_id,
                statuses_id: findStatusesId(department_id, data)
            };
        });
        function findStatusesId(department_id, data) {
            let items = data.filter((i) => i.department_id === department_id);
            return items.map((i) => i.status_id);
        }
    }
    async createDepartmentsLinks(data) {
        // @ts-ignore
        let result = await Promise.all(data.structs.map((struct) => this._createLinks(struct, data.account_id)));
        return result;
    }
    async _createLinks(struct, account_id) {
        return await Promise.all(struct.statuses_id.map(id => this._addOne(account_id, struct.department_id, id)));
    }
    async _addOne(account_id, department_id, status_id) {
        return StatusToDepartmentSchema.create({
            department_id, status_id, account_id
        });
    }
    async deleteStatuses(data) {
        // @ts-ignore
        return await Promise.all(data.structs.map((item) => this._deleteOne(item)));
    }
    async _deleteOne(struct) {
        await StatusToDepartmentSchema.destroy({
            where: {
                [Op.and]: [
                    // {account_id: struct.account_id},
                    { department_id: struct.department_id },
                    { status_id: { [Op.in]: struct.statuses_id } }
                ]
            }
        });
    }
    async updateItemsName(data) {
        // return await Promise.all(data.structs.map( (item: IItemSTD) => this._updateOne(item)));
    }
}
//# sourceMappingURL=STDFabric.js.map