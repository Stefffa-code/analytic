var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from './user/User';
import Gateway from './authorization/Gateway';
import Account from './account/Account';
import store from '../store';
import router from '../router';
import { getItem, removeItem } from "./core/storage";
import { AnalyticsWatcher } from "./analytics/watcher/Watcher";
export default class App {
    constructor() {
        this._initApp = false;
    }
    static get self() {
        if (App._self)
            return App._self;
        App._self = new App();
        return App._self;
    }
    get initApp() {
        return this._initApp;
    }
    set initApp(value) {
        this._initApp = !!value;
    }
    login(param) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Gateway.self.oAuth(param))
                && (yield this.init());
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            yield Gateway.self.logout();
            Account.self.reset();
            User.self.reset();
            store.commit('set_messageWhenLogin');
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initApp = (yield User.self.init())
                && (yield Account.self.defineAccount(User.self.accounts));
            yield AnalyticsWatcher.self.init(83); // todo add accouunt id
            return this.initApp;
        });
    }
    initOnce() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initApp)
                return true;
            yield Account.self.setAccountFromStorage();
            return yield this.init();
        });
    }
    beforePage() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.analiticRouteGuard()) && this.initOnce();
        });
    }
    analiticRouteGuard() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Gateway.self.routeGuard()) && (yield Gateway.self.checkAccount());
        });
    }
    comeFromExternal(externalUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const isAuth = yield Gateway.self.routeGuard();
            if (!isAuth) {
                let res = yield User.getPartialHiddenLogin(externalUser.user_id);
                if (!res.find)
                    return;
                this._setLoginMessageForUser(res);
                return;
            }
            yield this._compareUsers(externalUser.user_id);
            yield this._switchAccount(externalUser.account_id);
        });
    }
    _compareUsers(external_user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            let authUser = getItem('user');
            if (authUser.id != external_user_id) {
                yield this.logout();
                router.push('/login');
                return;
            }
            yield User.self.init();
        });
    }
    _setLoginMessageForUser(param) {
        let message = `Ваш логин ${param.email} `;
        if (param.phone)
            message += ` или ${param.phone}`;
        store.commit('set_messageWhenLogin', message);
    }
    _switchAccount(newAccountId) {
        return __awaiter(this, void 0, void 0, function* () {
            let account = User.self.accounts.find(acc => acc.id == newAccountId);
            if (!account) {
                removeItem('account');
                router.push('/profile');
                return;
            }
            yield Account.self.changeCurrentAccount(account);
            return;
        });
    }
}
//# sourceMappingURL=App.js.map