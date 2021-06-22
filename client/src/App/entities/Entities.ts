 import store from "../../store";
import {IVuePipelines} from "./segment/FSegmentFabric";
import FSegmentFabric = IVuePipelines.FSegmentFabric;
import {IDepartmentsFabricSpace} from "./department/FDepartmentsFabric";
import FDepartmentsFabric = IDepartmentsFabricSpace.FDepartmentsFabric;
import {IEmployeeSpace} from "./employees/FEmployeesFabric";
import FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
import {IVueStage} from "./segment/FStageFabric";
import FStagesFabric = IVueStage.FStagesFabric;




export class Entities {
  private static _self: Entities
  static get self(): Entities {
    if(Entities._self) return Entities._self
    Entities._self = new Entities()
    return Entities._self
  }


  async init(account_id: number){
    await Promise.all([
      FDepartmentsFabric.self.init(account_id),
      FSegmentFabric.self.init(account_id),
      FStagesFabric.self.init(account_id),
      FEmployeesFabric.self.init(account_id)
    ])

    this.joinAllDependencies()
    this.throwIntoStore()
  }


  private joinAllDependencies(){
    FDepartmentsFabric.self.joinEntities()
    FSegmentFabric.self.joinStatuses()
  }

  private throwIntoStore(){
    store.commit('loadAccountConsts')
    return true
  }

}
