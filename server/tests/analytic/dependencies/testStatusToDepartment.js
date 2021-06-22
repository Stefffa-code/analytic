import { BStatusesToDepartmentFabric } from "../../../analitic/dependencies/statusesToDepartment/STDFabric";
const chai = require('chai');
class TestFabricSTD {
    static generateFillDate(num_departs, num_statuses) {
        for (let i = 0; i < num_departs; i++) {
            let item = {};
            item.department_id = i + 1;
            item.statuses_id = [];
            for (let st = 0; st < num_statuses; st++) {
                let value = st + (i * num_statuses);
                item.statuses_id.push(value);
            }
            TestFabricSTD.fill_data.push(item);
        }
    }
    static generateUpdateDate(txt) {
        TestFabricSTD.fill_data.filter(department => {
            department.statuses_id.filter(status_id => {
                TestFabricSTD.update_data.push({
                    department_id: department.department_id,
                    status_id: status_id,
                    name: "name_" + txt + "_" + status_id
                });
            });
        });
    }
    static async saveInDb() {
        TestFabricSTD.generateFillDate(2, 8);
        await BStatusesToDepartmentFabric.self.addStatuses(TestFabricSTD.fill_data);
    }
    static async deleteFromDb() {
        await BStatusesToDepartmentFabric.self.deleteStatuses(TestFabricSTD.fill_data);
    }
    static async updateItems() {
        TestFabricSTD.generateUpdateDate('first');
        await BStatusesToDepartmentFabric.self.updateItems(TestFabricSTD.update_data);
    }
}
TestFabricSTD.fill_data = [];
TestFabricSTD.update_data = [];
export async function testStatusToDepartment() {
    describe('StatusesToDepartment', () => {
        it('create', async () => {
            const std = await TestFabricSTD.saveInDb();
            // chai.assert(std)
        });
        it('update', async () => {
            const std = await TestFabricSTD.updateItems();
        });
        it('delete', async () => {
            const std = await TestFabricSTD.deleteFromDb();
        });
    });
}
//# sourceMappingURL=testStatusToDepartment.js.map