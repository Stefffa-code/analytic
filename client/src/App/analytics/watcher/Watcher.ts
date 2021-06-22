import {AnalyticsStorage} from "./AnalyticsStorage";
import {IDateRangeSec} from "../../types/types";
import {Emitter} from "../../core/Emitter";
import {MetricsTree} from "../metric/MetricsTree";
import {FrontLogger} from "../../core/FrontLogger";
import {TestLoader} from "../../tests/analytics/testTree/TestMetricsTree";
import {Aggregator} from "../transformData/rollType/Aggregator";
import {Dates} from "../../core/Dates";
import {IndicatorsFabric} from "../metric/IndicatorsFabric";
import sizeof from 'object-sizeof'




export class AnalyticsWatcher{
  private static _self: AnalyticsWatcher
  static get self(): AnalyticsWatcher {
    if(AnalyticsWatcher._self) return AnalyticsWatcher._self
    AnalyticsWatcher._self = new AnalyticsWatcher()
    return AnalyticsWatcher._self
  }

  // @ts-ignore
  private _account_id: number
  private get accountId(): number{
    return this._account_id
  }

  protected subscribeOnEvents(){
    Emitter.self.subscribe('empty_web_storage', async () => {
      await this.loadAccountMetrics()

    })
  }

  protected async loadAccountMetrics(){
    try{
      let loaded = TestLoader.loadAllMetrics(this.accountId)
      let valid = MetricsTree.validateTree(loaded.tree, loaded.range)
      await this.saveMetrics(loaded.tree, loaded.range, loaded.fieldHandler)
    }catch (e) {
      console.log(e)
      await FrontLogger.write(this.accountId, e.stack)
    }
  }

  async init(account_id: number){
    this._account_id = account_id
    this.subscribeOnEvents()
    IndicatorsFabric.self.init( MetricsTree.self)
    await AnalyticsStorage.self.init(account_id)
    await this.getMetrics()
    await this.checkLatestUpdate()
  }

  private async saveMetrics(tree: any, range_secs: IDateRangeSec, handlers: any){
    console.log('saveMetrics')
    Aggregator.setHandlers(handlers)
    await Promise.all([
      AnalyticsStorage.self.saveHandlers(handlers),
      AnalyticsStorage.self.saveMetrics(tree),
      AnalyticsStorage.self.saveMetricsRange(range_secs),
    ])
  }

  protected async getMetrics(){
    console.log('getMetrics start')
    let start = new Date().getTime()
    let loaded = await Promise.all([
      AnalyticsStorage.self.getMetrics(),
      AnalyticsStorage.self.getMetricsRange(),
      AnalyticsStorage.self.getHandlers(),
    ])
    // console.log(sizeof(loaded))
    let metricsTree =  loaded[0]
    let range = loaded[1]
    let handlers = loaded[2]
    Aggregator.setHandlers(handlers)
    MetricsTree.self.setData(metricsTree, range, handlers)
    console.log('getMetrics end: ' + (new Date().getTime() - start ))
  }

  protected async checkLatestUpdate(){
    let yesterday =  Dates.yesterdaySec
    if(MetricsTree.self.endDateSec < yesterday){
      await this.loadUpdates()
    }
  }

  protected async loadUpdates(){
    try{
      console.log('loadUpdates')
      let loaded = TestLoader.loadSlice(this.accountId, MetricsTree.self.startDateSecForAddSlice )
      MetricsTree.self.addSlice(loaded.tree, loaded.range)
      await this.saveMetrics(MetricsTree.self.tree, MetricsTree.self.range, loaded.fieldHandler)
    }catch(e){
      await FrontLogger.write(this.accountId, e)
    }
  }

}

