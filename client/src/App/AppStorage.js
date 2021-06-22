import { IDepartmentsFabricSpace } from "./entities/department/FDepartmentsFabric";
var FDepartmentsFabric = IDepartmentsFabricSpace.FDepartmentsFabric;
import { IVuePipelines } from "./entities/segment/FSegmentFabric";
var FSegmentFabric = IVuePipelines.FSegmentFabric;
import { IEmployeeSpace } from "./entities/employees/FEmployeesFabric";
var FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
import { IVueStage } from "./entities/segment/FStageFabric";
var FStagesFabric = IVueStage.FStagesFabric;
import Account from "./account/Account";
export class AppStorage {
    static get departments() {
        return FDepartmentsFabric.self;
    }
    static get pipelines() {
        return FSegmentFabric.self;
    }
    static get employees() {
        return FEmployeesFabric.self;
    }
    static get statuses() {
        return FStagesFabric.self;
    }
    static get startDate() {
        return '2020-05-05';
    }
    static get account() {
        return Account.self;
    }
}
//# sourceMappingURL=AppStorage.js.map