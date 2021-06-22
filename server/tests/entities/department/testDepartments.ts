import {randomString, TestEntitiesFabric} from "../TestEntitiesFabric";

const chai = require('chai')

export async function testDepartments(): Promise<void> {
    describe('Department', () => {
        it('create', async () => {
            const title = randomString(10)
            const department = await TestEntitiesFabric.uniqueDepartment(title)
            chai.assert(!!department.account_id)
            chai.assert(title === department.title)
        })

        it('update', async () => {
            const title = randomString(8)
            const department = await TestEntitiesFabric.uniqueDepartment(title)
            chai.assert(!!department.account_id)
            chai.assert(title === department.title)
        })

    })
}