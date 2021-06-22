import {IndicatorFilter} from "./IndicatorFilter";
import {IDateRange, IDateRangeSec, IDepartmentShort, IShortFilter} from "../../types/types";
import {MetricsTree} from "./MetricsTree";
import {IndexedDate} from "../transformData/rollType/IndexedDate";
import {Aggregator} from "../transformData/rollType/Aggregator";
import moment, {Moment} from "moment";
import {AppStorage} from "../../AppStorage";



export class IndicatorsFabric {
  private static _self: IndicatorsFabric
  static get self(): IndicatorsFabric {
    if(IndicatorsFabric._self) return IndicatorsFabric._self
    IndicatorsFabric._self = new IndicatorsFabric()
    return IndicatorsFabric._self
  }

  private  _metrics_tree: any
  private _indicators: any = {}

  private get indicators():any{
    return this._indicators
  }

  private get metricsTree():MetricsTree{
    return this._metrics_tree
  }



  init(metricsTree: MetricsTree) {
    this._metrics_tree = metricsTree
  }

  get(metric_name: string | number): Indicator{
    let indicator = this.indicators[metric_name]
    if(!indicator){
      let metricBranch = this.metricsTree.metricBranch(metric_name)
      indicator = new Indicator(metricBranch,  this.metricsTree.startDateSec)
    }
    return indicator
  }

}


export class Indicator {
  private readonly _metric_tree: any
  private readonly _start_metrics_date_sec: any

  private _totalStruct: any
  private _usersStruct: any
  private _pipelinesStruct: any
  private _departmentsStruct: any


  get tree(){
    return JSON.parse(JSON.stringify(this._metric_tree))
  }

  private get startMetricsDateSec(){
    return this._start_metrics_date_sec
  }

  get users(): any{
    return this._usersStruct
  }

  get pipelines():any{
    return this._pipelinesStruct
  }

  get departments(){
    return this._departmentsStruct
  }

  get total(){
    return this._totalStruct
  }

  constructor(metricTree: any, startMetricsDateSec: any) {
    this._metric_tree = metricTree
    this._start_metrics_date_sec = startMetricsDateSec
  }

  private sanitizeFilter(filter:IShortFilter):IShortFilter{
    let range = {
      start: moment(filter.range.start.valueOf()),
      end: moment(filter.range.end.valueOf())
    }
    let copyFilter:IShortFilter = JSON.parse(JSON.stringify(filter))
    copyFilter.range = range
    copyFilter.range = this.toIndexedRange(<IDateRange>copyFilter.range)
    return copyFilter
  }

  updateTotal(filter:IShortFilter): any{
    let start = new Date().getTime()
    let copyFilter = this.sanitizeFilter(filter)
    let structure = IndicatorFilter.total(this.tree, copyFilter)
    this.rollFilteredMetric(structure)
    this._totalStruct = structure
    console.log(new Date().getTime() - start + ' total' )
    console.log(structure)
    return structure
  }

  updateUsers(filter:IShortFilter): any{
    let copyFilter = this.sanitizeFilter(filter)
    let structure = IndicatorFilter.byUsers(this.tree, copyFilter)
    this.rollFilteredMetric(structure)
    this._usersStruct = structure
    return structure
  }

  updatePipelines(filter:IShortFilter): any{
    let copyFilter = this.sanitizeFilter(filter)
    let structure = IndicatorFilter.byPipelines(this.tree, copyFilter)
    this.rollFilteredMetric(structure)
    this._pipelinesStruct = structure
    return structure
  }

  updateDepartments(filter:IShortFilter): any{

    let departments:IDepartmentShort[] = AppStorage.departments.shortModels
    let copyFilter = this.sanitizeFilter(filter)
    let start = new Date().getTime()
    let structure = IndicatorFilter.byDepartments(this.tree, copyFilter, departments)
    this.rollFilteredMetric(structure)
    this._departmentsStruct = structure
    console.log(new Date().getTime() - start + ' department' )
    return structure
  }

  private toIndexedRange(range: IDateRange): IDateRangeSec {
    return {
      start: IndexedDate.toIndex(this.startMetricsDateSec, <Moment> range.start),
      end: IndexedDate.toIndex(this.startMetricsDateSec, <Moment> range.end),
    }
  }

  private rollFilteredMetric(structure: any){
    Aggregator.structureAfterFilter(structure)
    return structure
  }
}

