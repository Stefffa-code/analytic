import { AccountSchema } from '../../../db/models/pragma_crm/index'
import {DepartmentsSchema} from "../../../db/models/pragma_users";
import {ICommonDepartment} from "../../entities/department/ICommonDepartment";
import IDepartStruct = ICommonDepartment.IDepartStruct;
const { Op } = require('sequelize');




export class AccountsTest {
    static async createNewAccountId () : Promise<number> {
        const id = await AccountsTest.createRowInTable()
        setTimeout(() => AccountsTest.deleteAccount(id), 2000)
        return id
    }

    private static async createRowInTable(): Promise<number> {
        const model = await  AccountSchema.create({ date_create: '2021-12-13 13:13:13', test: 1})
        return model.dataValues.id
    }

    private static async deleteAccount(id: number): Promise<void> {
        await AccountSchema.destroy({
            where:{ id }
        })
    }
}



export class TestEntitiesFabric {
    static async uniqueAccountId(): Promise<number> {
        return await AccountsTest.createNewAccountId()
    }

    static async uniqueDepartment(title: string = randomString(10)): Promise< IDepartStruct> {
        const accountId = await TestEntitiesFabric.uniqueAccountId()
        let created =  await DepartmentsSchema.create({
            account_id: accountId,
            title
        })
        return created.dataValues
    }
}

export function randomString(length: number): string {
    let result = ''
    do {
        result += Math.random().toString(36).substring(2)
        result = result.substring(0, length)
    }while (result.length < length)
    return result
}