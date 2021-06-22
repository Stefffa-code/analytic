var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { AnalyticsStorage } from "./AnalyticsStorage";
import { Emitter } from "../../core/Emitter";
import { MetricsTree } from "../metric/MetricsTree";
import { FrontLogger } from "../../core/FrontLogger";
import { TestLoader } from "../../tests/analytics/testTree/TestMetricsTree";
import { Aggregator } from "../transformData/rollType/Aggregator";
import { Dates } from "../../core/Dates";
import { IndicatorsFabric } from "../metric/IndicatorsFabric";
export class AnalyticsWatcher {
    static get self() {
        if (AnalyticsWatcher._self)
            return AnalyticsWatcher._self;
        AnalyticsWatcher._self = new AnalyticsWatcher();
        return AnalyticsWatcher._self;
    }
    get accountId() {
        return this._account_id;
    }
    subscribeOnEvents() {
        Emitter.self.subscribe('empty_web_storage', () => __awaiter(this, void 0, void 0, function* () {
            yield this.loadAccountMetrics();
        }));
    }
    loadAccountMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let loaded = TestLoader.loadAllMetrics(this.accountId);
                let valid = MetricsTree.validateTree(loaded.tree, loaded.range);
                yield this.saveMetrics(loaded.tree, loaded.range, loaded.fieldHandler);
            }
            catch (e) {
                console.log(e);
                yield FrontLogger.write(this.accountId, e.stack);
            }
        });
    }
    init(account_id) {
        return __awaiter(this, void 0, void 0, function* () {
            this._account_id = account_id;
            this.subscribeOnEvents();
            IndicatorsFabric.self.init(MetricsTree.self);
            yield AnalyticsStorage.self.init(account_id);
            yield this.getMetrics();
            yield this.checkLatestUpdate();
        });
    }
    saveMetrics(tree, range_secs, handlers) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('saveMetrics');
            Aggregator.setHandlers(handlers);
            yield Promise.all([
                AnalyticsStorage.self.saveHandlers(handlers),
                AnalyticsStorage.self.saveMetrics(tree),
                AnalyticsStorage.self.saveMetricsRange(range_secs),
            ]);
        });
    }
    getMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('getMetrics start');
            let start = new Date().getTime();
            let loaded = yield Promise.all([
                AnalyticsStorage.self.getMetrics(),
                AnalyticsStorage.self.getMetricsRange(),
                AnalyticsStorage.self.getHandlers(),
            ]);
            // console.log(sizeof(loaded))
            let metricsTree = loaded[0];
            let range = loaded[1];
            let handlers = loaded[2];
            Aggregator.setHandlers(handlers);
            MetricsTree.self.setData(metricsTree, range, handlers);
            console.log('getMetrics end: ' + (new Date().getTime() - start));
        });
    }
    checkLatestUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            let yesterday = Dates.yesterdaySec;
            if (MetricsTree.self.endDateSec < yesterday) {
                yield this.loadUpdates();
            }
        });
    }
    loadUpdates() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('loadUpdates');
                let loaded = TestLoader.loadSlice(this.accountId, MetricsTree.self.startDateSecForAddSlice);
                MetricsTree.self.addSlice(loaded.tree, loaded.range);
                yield this.saveMetrics(MetricsTree.self.tree, MetricsTree.self.range, loaded.fieldHandler);
            }
            catch (e) {
                yield FrontLogger.write(this.accountId, e);
            }
        });
    }
}
//# sourceMappingURL=Watcher.js.map