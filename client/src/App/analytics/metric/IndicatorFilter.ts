import {
  IPipelineShort,
  IDepartmentShort,
  IShortFilter,
  IValuesModel,
  IMultyValuesModel, IDateRangeSec
} from "../../types/types";


export class IndicatorFilter {
  static byUsers(metricTree:any, filter: IShortFilter):any{
    let filterMetric = new IndicatorFilter(metricTree, filter)
    return filterMetric.usersMetric()
  }

  static byPipelines(metricTree:any, filter: IShortFilter):any{
    let filterMetric = new IndicatorFilter(metricTree, filter)
    return filterMetric.pipelinesMetric()
  }

  static byDepartments(metricTree:any, filter: IShortFilter, departments?: IDepartmentShort[]):any{
    let filterMetric = new IndicatorFilter(metricTree, filter, departments)
    return filterMetric.departmentsMetric()
  }

  static total(metricTree:any, filter: IShortFilter):any{
    let filterMetric = new IndicatorFilter(metricTree, filter)
    return filterMetric.totalMetric()
  }

  private readonly _users_id: number[] = []
  private readonly _pipelines: IPipelineShort[] = []
  // @ts-ignore
  private readonly _range: IDateRangeSec = {}
  private readonly _departments: IDepartmentShort[] = []
  private readonly _metric_tree: any = {}
  private _fields: string[] = []

  private get users(): number[]{
    return this._users_id
  }

  private get pipelines(): IPipelineShort[]{
    return this._pipelines
  }

  private get range(): IDateRangeSec{
    return this._range
  }

  private get departments(): IDepartmentShort[]{
    return this._departments
  }

  private get metricTree(): any{
    return this._metric_tree
  }

  private get fieldsName(){
    return this._fields
  }

  private setRange(range:IDateRangeSec){
    if( typeof range.start != 'number' || typeof range.end != 'number'  ){
      throw Error('The range must be in numbers!')
    }
    this._range.start = range.start
    this._range.end = range.end
  }

  constructor(metricTree:any, filter: IShortFilter, departments?: IDepartmentShort[]) {
    this._metric_tree = metricTree
    this._users_id = filter.users_id
    this._pipelines = filter.pipelines
    this.setRange(<IDateRangeSec>filter.range)
    this._departments = departments || []
    this._fields = this.definedFields(metricTree)
  }

  private definedFields(struct): string[]{
    let userStruct: any = Object.values(struct)[0]
    let pipelineStruct: any = Object.values(userStruct)[0]
    let atom:any = Object.values(pipelineStruct)[0]
    return Object.keys(atom)
  }

  private totalMetric(): any | undefined{
    if( !this.users.length || !this.pipelines.length )
      return ;
    return this.toAllMetric()
  }

  private departmentsMetric(): any | undefined{
    if( !this.users.length || !this.pipelines.length || !this.departments.length)
      return ;
    return this.toDepartmentMetric()
  }

  private usersMetric(): any | undefined{
    if( !this.users.length || !this.pipelines.length )
      return ;
    return this.toUsersMetric(this.users)
  }

  private pipelinesMetric( ): any | undefined {
    if( !this.users.length || !this.pipelines.length )
      return ;
    return this.toPipelinesMetric( )
  }

  private toDepartmentMetric(){
    let structure = {}
    this.departments.forEach(department => {
      structure[department.id] = this.toDepartmentAtom(department.users_id)
    })
    return structure
  }

  private toUsersMetric(users: number[]): any{
    let structure = {}
    users.forEach(user => {
      let userTree = this.metricTree[user]
      if(userTree){
        structure[user] = this.toUserAtom(userTree)
      }
    })
    return structure
  }

  private toPipelinesMetric():any{
    let structure = { }
    let fields = this.pipelines.map( i => i.id)

    this.users.forEach( user => {
      let userTree = this.metricTree[user]
      if(userTree){
        let pipelinesStructure = this.toPipelinesUserMetric(userTree)
        this.additionToStructure(structure, pipelinesStructure, fields )
      }
    })
    return structure
  }

  private toPipelinesUserMetric(userTree:any): any{
    let struct = {}
    this.pipelines.forEach( pipeline => {
      let pipelineTree = userTree[pipeline.id]
      if(pipelineTree){
        struct[pipeline.id] = this.toPipelineAtom(pipelineTree, pipeline.statuses_id)
      }
    })
    return struct
  }

  private toDepartmentAtom( users: number[]): any {
    let departmentAtom = this.createEmptyAtom()
    let usersStruct = this.toUsersMetric(users)

    users.forEach(user => {
      let userAtom = usersStruct[user]
      if(userAtom){
        this.unionAtoms(departmentAtom, userAtom )
      }
    })
    return departmentAtom
  }

  private toAllMetric( ): IMultyValuesModel{
    let structure:any = {}
    let metricAtom = this.createEmptyAtom()
    this.users.forEach(user => {
      const start = new Date().getTime()
      let userTree = this.metricTree[user]
      if(userTree){
        let userAtom = this.toUserAtom(userTree)
        this.unionAtoms(metricAtom, userAtom)
      }
      const end = new Date().getTime()
      console.log('toAllMetric', end - start)
    })
    structure.total = metricAtom
    return structure
  }

  private toUserAtom(userThree:any): IMultyValuesModel | IValuesModel{
    let userAtom = this.createEmptyAtom()
    this.pipelines.forEach(pipeline => {
      let pipelineTree = userThree[pipeline.id]
      if(pipelineTree){
        let pipelineAtom = this.toPipelineAtom(pipelineTree, pipeline.statuses_id)
        this.unionAtoms(userAtom, pipelineAtom)
      }
    })
    return userAtom
  }

  private toPipelineAtom(pipelineTree:any, statuses: number[]): IMultyValuesModel | IValuesModel{
    let pipelineAtom = this.createEmptyAtom()
    statuses.forEach(status => {
      let atom = pipelineTree[status]
      if(atom){
        let cutAtom = this.cutRangeAtom(atom)
        this.unionAtoms(pipelineAtom, cutAtom)
      }
    })
    return pipelineAtom
  }

  private createEmptyAtom(): IMultyValuesModel  {
    let atom = {}
    this.fieldsName.forEach(field => {
      atom[field] = []
    })
    return atom
  }

  private cutRangeAtom(atom:IValuesModel): IMultyValuesModel{
    // let fieldsName = Object.keys(ValueName)
    let cutedAtom = {}
    this.fieldsName.forEach(field => {
      cutedAtom[field] = this.cutRangeInField(atom, field)
    })
    return cutedAtom
  }

  private cutRangeInField(atom: IValuesModel, field: string): number[][]{
    return (field in atom) ? this.cutRange(atom[field]) : []
  }

  private cutRange(data: number[]): number[][]{
    let groups: number[][] = []
    let end: number = (data.length < this.range.end) ? data.length :  <number>this.range.end + 1
    for(let i = <number>this.range.start; i < end; i++){
      groups.push([data[i]])
    }
    return groups
  }

  private unionAtoms(atom_1:IMultyValuesModel | IValuesModel, atom_2:IMultyValuesModel | IValuesModel){
    // let fieldsName = Object.keys(ValueName)
    this.fieldsName.forEach( field => {
      if( atom_2[field].length) {
        this.addition(atom_1[field], atom_2[field], field )
      }
    })
  }


  private addition(to: number[][], from: number[][], valueName:string | number){
    if(!to.length){
      to.push(...from)
      return
    }

    for(let i = 0; i < to.length; i++){
      to[i].push(...from[i])
      // let values =  to[i].concat(from[i])
      // to[i] = [ FieldAggregate.joinFiltratedValuesToField(values, valueName)]
    }
  }

  private additionToStructure(to:any, from:any, fields:number[] | string []){
    fields.forEach( field => {
      let atomTo = to[field]
      let atomFrom = from[field]

      if(!atomFrom )
        return;

      if(!atomTo){
        atomTo = this.createEmptyAtom()
        to[field] = atomTo
      }

      this.unionAtoms(atomTo, atomFrom)
    })
  }
}
