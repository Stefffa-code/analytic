import {IDateRange, IDepartmentShort, IFilterByStatuses, IPipelineShort, IShortFilter} from "../../types/types";
import {AppStorage} from "../../AppStorage";
import moment, {Moment} from "moment";



export class Filter {
  private static _self: Filter
  static get self(): Filter {
    if(Filter._self) return Filter._self
    Filter._self = new Filter()
    return Filter._self
  }

  // @ts-ignore
  private _range: IDateRange
  private _pipelines: IPipelineShort[] = []
  private _pipelines_id: number[] = []
  private _users_id: number[] = []
  private _departments: number[] =[]

  private get departmentShortModel(): IDepartmentShort[]{
    return AppStorage.departments.shortModels
  }

  private get pipelinesId(): number[]{
    return this._pipelines_id
  }

  get departments():number[]{
    return this._departments
  }

  get allPipelines():IPipelineShort[]{
    return this._pipelines
  }

  get pipelines():IPipelineShort[]{
    return AppStorage.pipelines.shortModelsActive.filter(pip => this.pipelinesId.includes(pip.id))
  }

  get range():IDateRange{
    return this._range
  }

  get usersId():number[]{
    return this._users_id
  }

  get modelActive():IShortFilter{
    return {
      pipelines: this.pipelines,
      users_id: this.usersId,
      range: this.range,
      departments: this.departments
    }
  }

  get modelClosedFail():IShortFilter{
    return {
      pipelines: this.setClosedStatusesInPipelines( [ AppStorage.statuses.failStatus.id ]),
      users_id: this.usersId,
      range: this.range,
      departments: this.departments
    }
  }

  get modelClosedSuccess():IShortFilter{
    return {
      pipelines: this.setClosedStatusesInPipelines( [ AppStorage.statuses.successStatus.id ]),
      users_id: this.usersId,
      range: this.range,
      departments: this.departments
    }
  }

  get filter(): IFilterByStatuses{
    return {
      active: this.modelActive,
      fail: this.modelClosedFail,
      success: this.modelClosedSuccess
    }
  }

  private setClosedStatusesInPipelines(statuses: number[]): IPipelineShort[]{
    return this.pipelines.map( p =>{
      return {
        id: p.id,
        statuses_id: statuses
      }
    } )
  }

  constructor() {
    this.setDefault()
  }

  private setDefault(){
    this._pipelines = AppStorage.pipelines.shortModelsActive
    this._pipelines_id = AppStorage.pipelines.shortModelsActive.map(i => i.id)
    this._users_id = AppStorage.employees.data.map( i => i.id)
    this._departments = AppStorage.departments.data.map( i => i.id)
    this._range = DatesRange.monthRange()
  }

  checkStatuses(pipeline_id: number, statuses_id:number[]){
    let pipeline = this.allPipelines.find( pip => pip.id === pipeline_id)

    if(pipeline)
      pipeline.statuses_id = [...pipeline.statuses_id, ...statuses_id];
  }

  uncheckStatuses(pipeline_id: number, statuses_id:number[]){
    let pipeline = this.allPipelines.find( pip => pip.id === pipeline_id)

    if(pipeline)
      pipeline.statuses_id = pipeline.statuses_id.filter( id => !statuses_id.includes(id) )
  }

  checkPipelines(pipelines_id: number[]){
    this._pipelines_id.push(...pipelines_id)
  }

  uncheckPipelines(pipelines_id: number[]){
    let data = this._pipelines_id.filter(id => !pipelines_id.includes(id))
    this._pipelines_id = data
  }

  checkUsers(users_id: number[]){
    this._users_id.push(...users_id)
  }

  uncheckUsers(users_id: number[]){
    this._users_id = this._users_id.filter(i => !users_id.includes(i))
  }

  checkDepartments(departments_id: number[]){
    this._departments.push(...departments_id)
    departments_id.forEach( id => {
      let model = this.findDepartmentModel(id)
      if(model) this.checkUsers(model.users_id);
    })
  }

  uncheckDepartments(departments_id: number[]){
    this._departments = this._departments.filter(i => !departments_id.includes(i))
    departments_id.forEach( id => {
      let model = this.findDepartmentModel(id)
      if(model) this.uncheckUsers(model.users_id);
    })
  }

  private findDepartmentModel(department_id: number): IDepartmentShort | undefined{
    return this.departmentShortModel.find( i => i.id === department_id )
  }

  setYesterdayRange(){
    this._range = DatesRange.yesterday()
  }

  setMonthRange(){
    this._range = DatesRange.monthRange()
  }

  setYearRange(){
    this._range = DatesRange.yearRange()
  }
}


export class DatesRange{
  static formateDate(date:Moment): string{
    if(date){
      return date.format("DD.MM.YYYY")
    }
    return ''
  }

  static  yearRange(): IDateRange{
    let range = new DatesRange()
    range.setYear()
    return range.model
  }

  static  monthRange():IDateRange{
    let range = new DatesRange()
    range.setMonth()
    return range.model
  }

  static  yesterday():IDateRange{
    let range = new DatesRange()
    range.setYesterday()
    return range.model
  }

  //@ts-ignore
  private _start: number | Moment
  //@ts-ignore
  private _end: number | Moment

  get model(): IDateRange{
    return <IDateRange>{
      start: this._start,
      end: this._end
    }
  }

  constructor() {
    this.setMonth()
  }

  setYesterday(){
    let yesterday = moment().subtract(1, 'd')
    this._start = yesterday
    this._end = yesterday
  }

  setMonth(){
    this._end = moment().subtract(1, 'd')
    this._start = moment().subtract(1, 'month')
    this._start.subtract(1, 'd')
  }

  setYear(){
    this._end = moment().subtract(1, 'd')
    this._start = moment().subtract(1, 'y')
    this._start.subtract(1, 'd')
  }

  changeDate(start: any, end:any){
    if(!start && !end){
      this._start = 0
      this._end = moment().valueOf()
      return
    }
    this._start = moment(start).valueOf()
    this._end = moment(end).valueOf()
  }


}
