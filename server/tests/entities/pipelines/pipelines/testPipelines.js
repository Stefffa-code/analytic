import { BSegmentsFabric } from "../../../entities/pipelines/SegmentsFabric";
const chai = require('chai');
class TestFabricPipelines {
    static genData(count) {
        for (let i = 0; i < count; i++) {
            let item = {
                name: "Segment-" + (i + 1),
                account_id: 82
            };
            TestFabricPipelines.create_data.push(item);
        }
    }
    static genUpdateData() {
        TestFabricPipelines.update_data = TestFabricPipelines.saved.map(item => {
            item.name = "Updated_name";
            item.sort = 666;
            return item;
        });
    }
    static genLinks() {
        TestFabricPipelines.create_links = TestFabricPipelines.saved.map(item => {
            let link = {
                segment_id: item.id,
                pipelines_id: [7, 8, 9, 10]
            };
            return link;
        });
    }
    static async getCategorized() {
        let res = await BSegmentsFabric.self.getCategorized(82);
        return res;
    }
    static async saveInDb() {
        TestFabricPipelines.genData(3);
        let saved = await BSegmentsFabric.self.createSegment(TestFabricPipelines.create_data);
        TestFabricPipelines.saved = saved;
        return saved;
    }
    static async updateInDb() {
        TestFabricPipelines.genUpdateData();
        let updated = await BSegmentsFabric.self.update(TestFabricPipelines.update_data);
        return updated;
    }
    static async deleteFromDb() {
        let ids = TestFabricPipelines.saved.map(i => i.id);
        let deleted = await BSegmentsFabric.self.deleteSegments(ids);
        return deleted;
    }
    static async addLinksPip() {
        TestFabricPipelines.genLinks();
        let links = TestFabricPipelines.create_links;
        let res = await BSegmentsFabric.self.addPipelinesToSegment(links);
        return res;
    }
    static async deleteLinksPip() {
        let links = TestFabricPipelines.create_links;
        let res = await BSegmentsFabric.self.deletePipelinesFromSegment(links);
        return res;
    }
}
TestFabricPipelines.create_data = [];
TestFabricPipelines.update_data = [];
export async function testPipelines() {
    describe('Segments', () => {
        it('get categorized pipelines', async () => {
            const std = await TestFabricPipelines.getCategorized();
            console.log(std);
        });
        it('create', async () => {
            const std = await TestFabricPipelines.saveInDb();
            // chai.assert(std)
        });
        it('update', async () => {
            const std = await TestFabricPipelines.updateInDb();
        });
        it('add pipelines to segment', async () => {
            const std = await TestFabricPipelines.addLinksPip();
        });
        it('delete pipelines from segment', async () => {
            const std = await TestFabricPipelines.deleteLinksPip();
        });
        it('delete', async () => {
            const std = await TestFabricPipelines.deleteFromDb();
        });
    });
}
//# sourceMappingURL=testPipelines.js.map