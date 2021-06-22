import {IDateRange, IDateRangeSec, IFieldHandler} from "../../types/types";
import {Dates} from "../../core/Dates";
import {throws} from "assert";



export class MetricsTree{
  private static _self: MetricsTree
  static get self(): MetricsTree {
    if(MetricsTree._self) return MetricsTree._self
    MetricsTree._self = new MetricsTree()
    return MetricsTree._self
  }

  static validateTree(tree: any,  range_sec: IDateRangeSec): boolean{
    let days =  Dates.difSecsInDays(range_sec.start, range_sec.end) + 1
    let countValues = MetricsTree.lengthValues(tree)
    if(days !== countValues){
      throw Error('ValidationMetricsTreeError: The number of values and days does not match')
    }
    return true
  }

  private static lengthValues(tree: any): number{
    let length: number = 0
    Object.values(tree).forEach( (indicator: any) => {
      Object.values(indicator).forEach( (user: any) =>{
        Object.values(user).forEach( (pipeline: any) =>{
          Object.values(pipeline).forEach( (status: any) =>{
            Object.values(status).forEach( (field: number[]) =>{
              if(!length)
                length = field.length;
              if(length != field.length)
                throw new Error('ValidationMetricsTreeError: Not all fields of an atom have the same number');
            })
          })
        })
      })
    })
    return length
  }

  private _tree: any
  //@ts-ignore
  private _start_date_sec: number
  //@ts-ignore
  private _end_date_sec: number
  private _field_handlers: IFieldHandler[] = []

  get fieldHandlers(): IFieldHandler[]{
    return this._field_handlers
  }

  get startDateSecForAddSlice(): number{
    return this.endDateSec + Dates.lengthDayInSecs
  }

  get tree(): any{
    return this._tree
  }

  get startDateSec(): number{
    return this._start_date_sec
  }
  get endDateSec(): number{
    return this._end_date_sec
  }

  get range():IDateRangeSec{
    return{
      start: this.startDateSec,
      end: this.endDateSec
    }
  }

  metricBranch(name: string | number): any{
    return JSON.parse(JSON.stringify(this.tree[name]))
  }

  setData(tree: any, range:IDateRangeSec, handlers: IFieldHandler[] ){
    this._tree = tree
    this._end_date_sec =  range.end
    this._start_date_sec =  range.start
    this._field_handlers = handlers
  }

  addBranches(branchesTree: any){
    Object.assign(this.tree, branchesTree)
  }

  addSlice(slice:any, range: IDateRangeSec){
    MetricsTree.validateTree(slice, range)
    let validDate = this.validateDate(range.start)
    if(validDate){
      this._end_date_sec = range.end
      this.joinSlice(slice)
    } else {
      throw new Error("not valid start date range for slice ")
    }
  }

  private validateDate(start_added_range_sec: number): boolean{
    return  start_added_range_sec === this.startDateSecForAddSlice
  }

  private joinSlice(slice: any){
    console.log('add slice')
    for( let indicator in this.tree ) {
      let indicatorBranch = this.tree[indicator]

      for (let user in indicatorBranch) {
        let userBranch = indicatorBranch[user]

        for (let pipeline in userBranch) {
          let pipelineBranch = userBranch[pipeline]

          for (let status in pipelineBranch) {
            let sliceAtom = slice[indicator][user][pipeline][status]
            this.additionToAtom(pipelineBranch[status], sliceAtom)
          }
        }
      }
    }
  }

  private additionToAtom(to, from){
    if(!from)
      throw new Error(' No atom found in slice');

    for(let field in to){
      let tofield =  to[field]
      let fromfield =  from[field]
      tofield.push(...fromfield)
    }
  }

}
