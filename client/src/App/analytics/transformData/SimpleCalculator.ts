import {IEntitiesShort} from "../../types/types";
import {Aggregator } from "./rollType/Aggregator";
import {Moment} from "moment";
import {UnfoldByDate} from "./rollType/UnfoldByDate";




export class SimpleCalculator  {
  static getBarByGroup(fields: string[], structure: any, group_entities?: IEntitiesShort[]){
    let newStruct = JSON.parse(JSON.stringify(structure))
    let calc = new SimpleCategory( fields,  newStruct,  group_entities)
    return calc.getByGroup()
  }

  static getBarByField(fields: string[], structure: any, field_entities?: IEntitiesShort[]){
    let newStruct = JSON.parse(JSON.stringify(structure))
    let calc = new SimpleCategory( fields,  newStruct,  field_entities)
    return calc.getByField()
  }

  static getLineByGroup( fields: any[], structure: any, startDate: Moment){
    let newStruct = JSON.parse(JSON.stringify(structure))
    return UnfoldByDate.byGroups( newStruct,  fields,  startDate)
  }

  static getLineByField(fields: any[], structure: any,  startDate: Moment){
    let newStruct = JSON.parse(JSON.stringify(structure))
    return UnfoldByDate.byFields( newStruct,  fields,  startDate)
  }

}


class SimpleCategory {
  private readonly fields:string[]
  private readonly structure:any
  private readonly entities?: IEntitiesShort[]

  constructor(fields: string[], structure: any, entities?: IEntitiesShort[]) {
    this.fields = fields
    this.structure = structure
    this.entities = entities
  }

  getByGroup():any{
    let aggregated = Aggregator.structure(this.structure, [])
    return this.transformByGroup(aggregated)
  }

  private transformByGroup(struct: any ):any[]{
    let res: any[] = []
    Object.keys(struct).forEach( name => {
      let atom = struct[name]
      let item:any = {}
      item.name = this.getName(name)
      this.fields.forEach( field => {
        item[field] = atom[field]
      })
      res.push(item)
    })
    return res
  }

  private getName( id: string | number): string{
    if(!this.entities)
      return id.toString()
    let found = this.entities.find( i => i.id === +id)
    return found ? found.id.toString() : id.toString()
  }

  getByField( ):any{
    let aggregated = Aggregator.structure(this.structure, [])
    return this.transformByFields(aggregated)
  }

  private transformByFields(sruct: any ):any[]{
    let res: any[] = []
    let groupNames = Object.keys(sruct)
    this.fields.forEach( field => {
      let item: any = {}
      item.name = this.getName(field)
      groupNames.forEach( name => {
        item[name] = sruct[name][field]
      })
      res.push(item)
    })
    return res
  }
}
















