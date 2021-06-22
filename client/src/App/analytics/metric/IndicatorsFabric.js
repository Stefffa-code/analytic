import { IndicatorFilter } from "./IndicatorFilter";
import { IndexedDate } from "../transformData/rollType/IndexedDate";
import { Aggregator } from "../transformData/rollType/Aggregator";
import moment from "moment";
import { AppStorage } from "../../AppStorage";
export class IndicatorsFabric {
    constructor() {
        this._indicators = {};
    }
    static get self() {
        if (IndicatorsFabric._self)
            return IndicatorsFabric._self;
        IndicatorsFabric._self = new IndicatorsFabric();
        return IndicatorsFabric._self;
    }
    get indicators() {
        return this._indicators;
    }
    get metricsTree() {
        return this._metrics_tree;
    }
    init(metricsTree) {
        this._metrics_tree = metricsTree;
    }
    get(metric_name) {
        let indicator = this.indicators[metric_name];
        if (!indicator) {
            let metricBranch = this.metricsTree.metricBranch(metric_name);
            indicator = new Indicator(metricBranch, this.metricsTree.startDateSec);
        }
        return indicator;
    }
}
export class Indicator {
    constructor(metricTree, startMetricsDateSec) {
        this._metric_tree = metricTree;
        this._start_metrics_date_sec = startMetricsDateSec;
    }
    get tree() {
        return JSON.parse(JSON.stringify(this._metric_tree));
    }
    get startMetricsDateSec() {
        return this._start_metrics_date_sec;
    }
    get users() {
        return this._usersStruct;
    }
    get pipelines() {
        return this._pipelinesStruct;
    }
    get departments() {
        return this._departmentsStruct;
    }
    get total() {
        return this._totalStruct;
    }
    sanitizeFilter(filter) {
        let range = {
            start: moment(filter.range.start.valueOf()),
            end: moment(filter.range.end.valueOf())
        };
        let copyFilter = JSON.parse(JSON.stringify(filter));
        copyFilter.range = range;
        copyFilter.range = this.toIndexedRange(copyFilter.range);
        return copyFilter;
    }
    updateTotal(filter) {
        let start = new Date().getTime();
        let copyFilter = this.sanitizeFilter(filter);
        let structure = IndicatorFilter.total(this.tree, copyFilter);
        this.rollFilteredMetric(structure);
        this._totalStruct = structure;
        console.log(new Date().getTime() - start + ' total');
        return structure;
    }
    updateUsers(filter) {
        let copyFilter = this.sanitizeFilter(filter);
        let structure = IndicatorFilter.byUsers(this.tree, copyFilter);
        this.rollFilteredMetric(structure);
        this._usersStruct = structure;
        return structure;
    }
    updatePipelines(filter) {
        let copyFilter = this.sanitizeFilter(filter);
        let structure = IndicatorFilter.byPipelines(this.tree, copyFilter);
        this.rollFilteredMetric(structure);
        this._pipelinesStruct = structure;
        return structure;
    }
    updateDepartments(filter) {
        let departments = AppStorage.departments.shortModels;
        let copyFilter = this.sanitizeFilter(filter);
        let start = new Date().getTime();
        let structure = IndicatorFilter.byDepartments(this.tree, copyFilter, departments);
        this.rollFilteredMetric(structure);
        this._departmentsStruct = structure;
        console.log(new Date().getTime() - start + ' department');
        return structure;
    }
    toIndexedRange(range) {
        return {
            start: IndexedDate.toIndex(this.startMetricsDateSec, range.start),
            end: IndexedDate.toIndex(this.startMetricsDateSec, range.end),
        };
    }
    rollFilteredMetric(structure) {
        Aggregator.structureAfterFilter(structure);
        return structure;
    }
}
//# sourceMappingURL=IndicatorsFabric.js.map