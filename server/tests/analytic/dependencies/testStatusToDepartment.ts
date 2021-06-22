import {ICommonSTD} from "../../../entities/dependencies/statusesToDepartment/ICommonSTD";
import ITestChangesSTD = ICommonSTD.ITestChangesSTD;
import ITestItemSTD = ICommonSTD.ITestItemSTD;
import {BStatusesToDepartmentFabric} from "../../../entities/dependencies/statusesToDepartment/STDFabric";
const chai = require('chai')



class TestFabricSTD {
    private static fill_data: ITestChangesSTD[] = []
    private static update_data: ITestItemSTD[] = []

    private static generateFillDate(num_departs: number, num_statuses: number){
        for(let i = 0; i < num_departs; i++){
            let item: ITestItemSTD | any  = {}
            item.department_id = i + 1
            item.statuses_id = []

            for(let st = 0; st < num_statuses; st++){
                let value = st + ( i * num_statuses )
                item.statuses_id.push(value)
            }
            TestFabricSTD.fill_data.push(item)
        }
    }

    private static generateUpdateDate(txt: string){
        TestFabricSTD.fill_data.filter(department => {
            department.statuses_id.filter(status_id => {
                TestFabricSTD.update_data.push({
                    department_id:department.department_id,
                    status_id: status_id,
                    name: "name_" + txt + "_" + status_id
                })
            })
        })
    }

    static async saveInDb(){
        TestFabricSTD.generateFillDate(2, 8)
        await BStatusesToDepartmentFabric.self.createDepartmentsLinks(TestFabricSTD.fill_data)
    }

    static async deleteFromDb(){
        await BStatusesToDepartmentFabric.self.deleteStatuses(TestFabricSTD.fill_data)
    }

    static async updateItems(){
        TestFabricSTD.generateUpdateDate('first')
        await BStatusesToDepartmentFabric.self.updateItemsName(TestFabricSTD.update_data)
    }

 }



export async function testStatusToDepartment(): Promise<void> {
    describe('StatusesToDepartment', () => {
        it('create', async () => {
            const std = await TestFabricSTD.saveInDb()
            // chai.assert(std)
        })

        it('update', async () => {
            const std = await TestFabricSTD.updateItems()
        })


        it('delete', async () => {
            const std = await TestFabricSTD.deleteFromDb()
        })

    })
}