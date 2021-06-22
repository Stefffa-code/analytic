import {IEntitiesShort} from "../../types/types";
import {Aggregator} from "./rollType/Aggregator";
import {UnfoldByDate} from "./rollType/UnfoldByDate";
import {Moment} from "moment";




export class ComplexCalculator {
  static getByCategory(fields: any, multi_structures: any, entities?: IEntitiesShort[]):any{
    let newStruct = JSON.parse(JSON.stringify(multi_structures))
    let aggregStruct = ComplexCalculator.aggregateMultiStruct(newStruct, fields)
    let bar =new ComplexCategory( fields,  aggregStruct,  entities)
    return bar.run()
  }

  private static aggregateMultiStruct(multi_structures: any, fields: any){
    let newStruct = JSON.parse(JSON.stringify(multi_structures))
    let res = {}
    Object.keys(newStruct).forEach( name => {
        res[name] = Aggregator.structure(newStruct[name], [fields[name] ])
      }
    )
    return res
  }

  static getByDates(fields: any, multi_structures: any, start_date:Moment):any{
    let newStruct = JSON.parse(JSON.stringify(multi_structures))
    let transform = new ComplexUnfold(fields, newStruct, start_date)
    let res = transform.run()
    return res
  }

}


class ComplexCategory {
  private readonly fields: any
  private readonly multiStructure: any
  private readonly entities: IEntitiesShort[] | undefined
  private resultStruct: any = {}
  private _keys: string[] = []

  private get keys(){
    return this._keys
  }

  constructor(fields: any, structures: any, entities?: IEntitiesShort[]) {
    this.fields = fields
    this.multiStructure = structures
    this.entities = entities
    this.getKeys()
  }

  private getKeys(){
    this._keys = Object.keys(this.multiStructure)
  }

  run(): any{
    this.transform()
    return Object.values( this.resultStruct  )
  }

  private transform(): any {
    Object.keys( this.multiStructure ).forEach( name => {
      let struct = this.multiStructure[name]
      this.transformMetric(struct, name)
    })
  }

  private transformMetric(struct:any, metric_name: string ){
    Object.keys( struct ).forEach( name => {
      let atom = struct[name]
      let groupEnt = this.getStruct(this.resultStruct, name, name)
      groupEnt[metric_name] = atom[this.fields[metric_name]]
    })
  }

  private getStruct( structure:any, field: string, name?:string | number){
    let group = structure[field]
    if(!group){
      group = {}
      structure[field] = group
    }
    if(name) group.name = this.getName(name);
    return group
  }

  private getName(id: number | string):string{
    if(!this.entities) return id.toString();
    let found = this.entities.find( i => i.id === (+id))
    return found ? found.name : id.toString()
  }

}



class ComplexUnfold {
  private readonly fields: any
  private readonly multiStructure: any
  private readonly start_date: Moment
  private resultStruct: any = {}

  constructor(fields: any, structures: any, start_date:Moment) {
    this.fields = fields
    this.multiStructure = structures
    this.start_date = start_date
  }

  run(){
    Object.keys(this.multiStructure).forEach( struct_name => {
      let struct = this.multiStructure[struct_name]
      this.structHandler(struct, struct_name)
    })

    let unfolded = {}
    Object.keys(this.resultStruct).forEach( atom_name => {
      let atom = this.resultStruct[atom_name]
      unfolded[atom_name] = UnfoldByDate.unfoldAtom(atom, this.start_date)
    })

    return unfolded
  }

  private structHandler(struct: any, struct_name: string){
    Object.keys(struct).forEach( group_name => {
      let group_atom = struct[group_name]
      this.groupHandler(group_atom, group_name, struct_name)
    })
  }

  private groupHandler(atom:any, group_name: string, struct_name:string){
      let group = this.getStruct(this.resultStruct, group_name)
      group[struct_name] = atom[this.fields[struct_name]]
  }

  private getStruct( structure:any, field: string){
    let group = structure[field]
    if(!group){
      group = {}
      structure[field] = group
    }
    return group
  }



}
