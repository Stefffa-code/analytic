import {IDepartmentsFabricSpace} from "./entities/department/FDepartmentsFabric";
import FDepartmentsFabric = IDepartmentsFabricSpace.FDepartmentsFabric;

import {IVuePipelines} from "./entities/segment/FSegmentFabric";
import FSegmentFabric = IVuePipelines.FSegmentFabric;
import {IEmployeeSpace} from "./entities/employees/FEmployeesFabric";
import FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
import {IVueStage} from "./entities/segment/FStageFabric";
import FStagesFabric = IVueStage.FStagesFabric;
import Account from "./account/Account";



export class AppStorage {

  static get departments(): FDepartmentsFabric{
    return FDepartmentsFabric.self
  }

  static get pipelines(): FSegmentFabric{
    return FSegmentFabric.self
  }

  static get employees(): FEmployeesFabric{
    return FEmployeesFabric.self
  }

  static get statuses(): FStagesFabric{
    return FStagesFabric.self
  }

  static get startDate(): any{
    return '2020-05-05'
  }

  static get account(){
    return Account.self
  }


}
