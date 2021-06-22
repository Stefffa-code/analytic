import { AccountSchema } from '../../../db/models/pragma_crm/index';
import { DepartmentsSchema } from "../../../db/models/pragma_users/index";
const { Op } = require('sequelize');
export class AccountsTest {
    static async createNewAccountId() {
        const id = await AccountsTest.createRowInTable();
        setTimeout(() => AccountsTest.deleteAccount(id), 2000);
        return id;
    }
    static async createRowInTable() {
        const model = await AccountSchema.create({ date_create: '2021-12-13 13:13:13', test: 1 });
        return model.dataValues.id;
    }
    static async deleteAccount(id) {
        await AccountSchema.destroy({
            where: { id }
        });
    }
}
export class TestEntitiesFabric {
    static async uniqueAccountId() {
        return await AccountsTest.createNewAccountId();
    }
    static async uniqueDepartment(title = randomString(10)) {
        const accountId = await TestEntitiesFabric.uniqueAccountId();
        let created = await DepartmentsSchema.create({
            account_id: accountId,
            title
        });
        return created.dataValues;
    }
}
export function randomString(length) {
    let result = '';
    do {
        result += Math.random().toString(36).substring(2);
        result = result.substring(0, length);
    } while (result.length < length);
    return result;
}
//# sourceMappingURL=TestEntitiesFabric.js.map