import {IndexedDate} from "./IndexedDate";
import {Moment} from "moment";



export class UnfoldByDate {
  static byFields(structure: any, fields: any[], startDate: Moment ):any{
    let converter = new UnfoldByDate(structure, startDate, fields)
    return converter.unfoldByFields()
  }

  static byGroups(structure: any, fields: any[], startDate: Moment ):any{
    let converter = new UnfoldByDate(structure,  startDate, fields)
    return converter.unfoldByGroups()
  }

  static unfoldAtom(atom:any, startDate:Moment ){
    let converter = new UnfoldByDate(atom,  startDate, [])
    return converter.unfoldAtom(atom)
  }


  private _structure: any |  any[]
  private _fields: string[] | number[]
  private _startDate: Moment

  private get structure(){
    return this._structure
  }

  private get fields(){
    return this._fields
  }

  private get startDate(){
    return this._startDate
  }

  constructor(structure: any | any[], startDate: Moment,  fields: any[]) {
    this._structure = structure
    this._fields = fields
    this._startDate = startDate
  }

  private unfoldByFields(): any{
    let result = {}

    this.fields.forEach( field => {
      result[field] = this.unfoldOneField(field)
    })
    return result
  }

  private unfoldOneField( field: any){
    let length = this.getLengthField( Object.values(this.structure)[0] )
    if(!length)
      return;

    let result: any[] = []
    let group_names = Object.keys(this.structure)

    for(let i = 0; i < length; i++){
      let item = this.unfoldFieldByOneDay(i, field, group_names)
      result.push(item)
    }
    return result
  }

  private unfoldFieldByOneDay(index: number, field:string, group_names: string[]): any{
    let item: any = {}
    item.date = IndexedDate.toDate(this.startDate, index).toDate()
    group_names.forEach( name => {
      item[name] = this.structure[name][field][index]
    })
    return item
  }

  private getLengthField(atom:any): number {
    // @ts-ignore
    let res: any[] = Object.values(atom)[0]
    return res.length
  }


  private unfoldByGroups():any{
    let result = {}

    Object.keys( this.structure ).forEach( group_name => {
      let atom = this.structure[group_name]
      result[group_name] = this.unfoldOneGroup(atom)
    })
    return result
  }

  private unfoldOneGroup(groupAtom: any){
    let length = this.getLengthField( groupAtom)
    if(!length)
      return;

    let result: any[] = []
    for(let i = 0; i < length; i++){
      result.push( this.unfoldGroupByOneDay(i, groupAtom) )
    }
    return result
  }

  private unfoldGroupByOneDay(index: number, atom: any): any{
    let item: any = {}
    item.date =  IndexedDate.toDate(this.startDate, index).toDate()

    this.fields.forEach( field => {
      item[field] = atom[field][index]
    })
    return item
  }

  private unfoldAtom( atom: any ){
    let length = this.getLengthField( atom)
    if(!length)
      return;

    let result: any[] = []
    for(let i = 0; i < length; i++){
      result.push( this.unfoldAtomInOneDay(i, atom) )
    }
    return result
  }

  private unfoldAtomInOneDay(index, atom){
    let item: any = {}
    item.date =  IndexedDate.toDate(this.startDate, index).toDate()

    Object.keys(atom).forEach( field => {
      item[field] = atom[field][index]
    })
    return item
  }

}

