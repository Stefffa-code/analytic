import {ICommonStatuses} from "../../../../entities/pipelines/statuses/ICommonStatuses";
import ITestCreateStage = ICommonStatuses.ITestCreateStage;
import ITestItemStage = ICommonStatuses.ITestItemStage;
import {BStagesFabric} from "../../../../entities/pipelines/statuses/StatusesFabric";
import ITestLinkStatuses = ICommonStatuses.ITestLinkStatuses;
import {StagesRouter} from "../../../../entities/pipelines/statuses/StatusesRouter";

const chai = require('chai')


class TestFabricStatuse {
    private static create_data:  ITestCreateStage[] = []
    private static  saved: ITestItemStage[]
    private static update_data: ITestItemStage[] = []
    private static  create_links: ITestLinkStatuses[]


    static genData(count: number):ITestCreateStage[] {
        for(let i = 0; i < count; i++){
            let item = {
                name: "Status-" + ( i + 1),
                color: "#6548ad",
                sort: ( i + 1 ) * 10,
                pipeline_id: 2,
            }
            TestFabricStatuse.create_data.push(item)
        }
        return TestFabricStatuse.create_data
    }

    static genUpdateData(): ITestItemStage[]{
        TestFabricStatuse.update_data = TestFabricStatuse.saved.map(item => {
            item.name = "Status_updated"
            item.sort = item.sort + 6
            item.color = "#222222"
            return item
        })
        return TestFabricStatuse.update_data
    }

    static genLinks(){
        TestFabricStatuse.create_links = TestFabricStatuse.saved.map(item => {
            return {
                stage_id: item.id,
                statuses_id: [7,8,9,10]
            }
        })
        return TestFabricStatuse.create_links
    }

    static async  get(){
        let res = await  BStagesFabric.self.get([203, 204, 72, 73])
        return res
    }

    static async  saveInDb( ){
        TestFabricStatuse.genData(3)
        let saved = await BStagesFabric.self.create(TestFabricStatuse.create_data)
        TestFabricStatuse.saved = saved
        return saved
    }

    static async  updateInDb( ){
        TestFabricStatuse.genUpdateData()
        let updated = await BStagesFabric.self.update(TestFabricStatuse.update_data)
        return updated
    }

    static async  deleteFromDb( ){
        let ids = TestFabricStatuse.saved.map(i => i.id)
        let deleted = await BStagesFabric.self.deleteStages(ids)
        return deleted
    }

    static async  addLinksStatuses( ){
        TestFabricStatuse.genLinks()
        let links = TestFabricStatuse.create_links
        let res = await BStagesFabric.self.addLinksStatusesToStage(links)
        return res
    }

    static async  deleteLinksStatuses( ){
        let links = TestFabricStatuse.create_links
        let res = await BStagesFabric.self.deleteLinksStatusesToStage( links)
        return res
    }
}



export async function testStatuses(): Promise<void> {
    describe('Statuses', () => {
        it('get statuses on pipelines', async () => {
            const std = await TestFabricStatuse.get()
            console.log(std)
        })

        // it('create', async () => {
        //     const std = await TestFabricStatuse.saveInDb()
        //     // chai.assert(std)
        // })
        //
        // it('update', async () => {
        //     const std = await TestFabricStatuse.updateInDb()
        // })
        //
        // it('add statuses to stage', async () => {
        //     const std = await TestFabricStatuse.addLinksStatuses()
        // })

        // it('delete statuses from stage', async () => {
        //     const std = await TestFabricStatuse.deleteLinksStatuses()
        // })
        //
        // it('delete', async () => {
        //     const std = await TestFabricStatuse.deleteFromDb()
        // })

    })
}