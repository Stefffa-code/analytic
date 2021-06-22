 import {testStatusToDepartment} from "./dependencies/testStatusToDepartment";



export async function testDependencies(): Promise<void> {
    await testStatusToDepartment()
}