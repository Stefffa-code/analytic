var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { openDB, deleteDB } from 'idb';
import { Emitter } from "../../core/Emitter";
export class AnalyticsStorage {
    constructor() {
        this.dbVersion = 1;
        this.metricsStore = 'Metrics';
    }
    static get self() {
        if (AnalyticsStorage.inst)
            return AnalyticsStorage.inst;
        AnalyticsStorage.inst = new AnalyticsStorage();
        return AnalyticsStorage.inst;
    }
    setDbName(account_id) {
        this._analytic_db_name = 'Analytic_' + account_id;
    }
    get dbName() {
        return this._analytic_db_name;
    }
    init(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.setDbName(account_id);
            // await this.deleteAnalyticDb()
            yield this.openDb();
        });
    }
    deleteAnalyticDb() {
        return __awaiter(this, void 0, void 0, function* () {
            yield deleteDB(this.dbName, {
                blocked() {
                    console.log('deleteDB blocked');
                },
            });
        });
    }
    openDb() {
        return __awaiter(this, void 0, void 0, function* () {
            let empty = false;
            this.IDB = yield openDB(this.dbName, this.dbVersion, {
                upgrade(db, oldVersion, newVersion, transaction) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (oldVersion === 0) {
                            AnalyticsStorage.self.createMetricsStorage(db);
                            empty = true;
                            return db;
                        }
                        if (oldVersion !== newVersion) {
                            // todo: update
                        }
                    });
                },
                blocked() { console.log('blocked'); },
                blocking() { console.log('blocking'); },
                terminated() { console.log('terminated'); },
            });
            if (empty)
                yield Emitter.self.emit('empty_web_storage');
        });
    }
    createMetricsStorage(db) {
        if (!db.objectStoreNames.contains(this.metricsStore)) {
            db.createObjectStore(this.metricsStore);
        }
    }
    deleteFromStore(storeName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = this.IDB.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const result = yield store.get(key);
            if (!result)
                return;
            yield store.delete(key);
        });
    }
    putToStore(storeName, value, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = this.IDB.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            yield store.put(value, key);
            yield tx.done;
        });
    }
    getFromStore(storeName, key) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = this.IDB.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            return yield store.get(key);
        });
    }
    get version() {
        return this.IDB.version;
    }
    getMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('get from indexedDb');
            let res = yield this.getFromStore(this.metricsStore, 'data');
            return JSON.parse(res.data);
        });
    }
    saveMetrics(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let entity = {};
            entity.data = JSON.stringify(data);
            yield this.putToStore(this.metricsStore, entity, 'data');
        });
    }
    getMetricsRange() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFromStore(this.metricsStore, 'info');
        });
    }
    saveMetricsRange(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.putToStore(this.metricsStore, data, 'info');
        });
    }
    getHandlers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.getFromStore(this.metricsStore, 'handlers');
        });
    }
    saveHandlers(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.putToStore(this.metricsStore, data, 'handlers');
        });
    }
}
//# sourceMappingURL=AnalyticsStorage.js.map