var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as axios from "./axios";
export class FrontLogger {
    static write(account_id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield axios.send(FrontLogger.path, { account_id, message });
        });
    }
    static get path() {
        return 'api/logs';
    }
}
//# sourceMappingURL=FrontLogger.js.map