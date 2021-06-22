var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import store from "../../store";
import { IVuePipelines } from "./segment/FSegmentFabric";
var FSegmentFabric = IVuePipelines.FSegmentFabric;
import { IDepartmentsFabricSpace } from "./department/FDepartmentsFabric";
var FDepartmentsFabric = IDepartmentsFabricSpace.FDepartmentsFabric;
import { IEmployeeSpace } from "./employees/FEmployeesFabric";
var FEmployeesFabric = IEmployeeSpace.FEmployeesFabric;
import { IVueStage } from "./segment/FStageFabric";
var FStagesFabric = IVueStage.FStagesFabric;
export class Entities {
    static get self() {
        if (Entities._self)
            return Entities._self;
        Entities._self = new Entities();
        return Entities._self;
    }
    init(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                FDepartmentsFabric.self.init(account_id),
                FSegmentFabric.self.init(account_id),
                FStagesFabric.self.init(account_id),
                FEmployeesFabric.self.init(account_id)
            ]);
            this.joinAllDependencies();
            this.throwIntoStore();
        });
    }
    joinAllDependencies() {
        FDepartmentsFabric.self.joinEntities();
        FSegmentFabric.self.joinStatuses();
    }
    throwIntoStore() {
        store.commit('loadAccountConsts');
        return true;
    }
}
//# sourceMappingURL=Entities.js.map