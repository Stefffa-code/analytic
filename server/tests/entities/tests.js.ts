import {testDepartments} from "./department/testDepartments";
import {testPipelines} from "./pipelines/pipelines/testPipelines";
import {testStatuses} from "./pipelines/statuses/testStatuses";




export async function testEntities(): Promise<void> {
    // await testDepartments()
    // await testPipelines()
    await testStatuses()
}
