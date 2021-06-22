import {BSegmentsFabric} from "../../../../entities/pipelines/pipelines/SegmentsFabric";
import {ICommonPipeline} from "../../../../entities/pipelines/pipelines/ICommonSegments";
import ITestCreateSegment = ICommonPipeline.ITestCreateSegment;
import ITestItemPipeline = ICommonPipeline.ITestItemPipeline;
import ITestLinkSegment = ICommonPipeline.ITestLinkSegment;

const chai = require('chai')


class TestFabricPipelines {
    private static create_data:  ITestCreateSegment[] = []
    private static  saved: ITestItemPipeline[]
    private static update_data: ITestItemPipeline[] = []
    private static  create_links: ITestLinkSegment []


    static genData(count: number): void{
        for(let i = 0; i < count; i++){
            let item = {
                name: "Segment-" + ( i + 1),
                account_id: 82
            }
            TestFabricPipelines.create_data.push(item)
        }
    }

    static genUpdateData(){
        TestFabricPipelines.update_data = TestFabricPipelines.saved.map(item => {
            item.name = "Updated_name"
            item.sort = 666
            return item
        })
    }

    static genLinks(){
        TestFabricPipelines.create_links = TestFabricPipelines.saved.map(item => {
            let link = {
                segment_id: item.id,
                pipelines_id: [7,8,9,10]
            }
            return link
        })
    }

    static async  getCategorized( ){
        let res = await BSegmentsFabric.self.getCategorized(82)
        return res
    }

    static async  saveInDb( ){
        TestFabricPipelines.genData(3)
        let saved = await BSegmentsFabric.self.createSegments(TestFabricPipelines.create_data)
        TestFabricPipelines.saved = saved
        return saved
    }

    static async  updateInDb( ){
        TestFabricPipelines.genUpdateData()
        let updated = await BSegmentsFabric.self.updateSegment(TestFabricPipelines.update_data)
        return updated
    }

    static async  deleteFromDb( ){
        let ids = TestFabricPipelines.saved.map(i => i.id)
        let deleted = await BSegmentsFabric.self.deleteSegments(ids)
        return deleted
    }

    static async  addLinksPip( ){
        TestFabricPipelines.genLinks()
        let links = TestFabricPipelines.create_links
        let res = await BSegmentsFabric.self.addPipelinesToSegment(links)
        return res
    }

    static async  deleteLinksPip( ){
        let links = TestFabricPipelines.create_links
        let res = await BSegmentsFabric.self.deletePipelinesFromSegment( links)
        return res
    }
}



export async function testPipelines(): Promise<void> {
    describe('Segments', () => {
        it('get categorized pipelines', async () => {
            const std = await TestFabricPipelines.getCategorized()
            console.log(std)
        })

        it('create', async () => {
            const std = await TestFabricPipelines.saveInDb()
            // chai.assert(std)
        })

        it('update', async () => {
            const std = await TestFabricPipelines.updateInDb()
        })

        it('add pipelines to segment', async () => {
            const std = await TestFabricPipelines.addLinksPip()
        })

        it('delete pipelines from segment', async () => {
            const std = await TestFabricPipelines.deleteLinksPip()
        })

        it('delete', async () => {
            const std = await TestFabricPipelines.deleteFromDb()
        })

    })
}