import { ValueHandlers } from "../../../types/enums";
import {IFieldHandler} from "../../../types/types";




export class Aggregator {
  private static _handlers?: any
  private static atomAggregator: AtomAggregate

  static get handlers():any{
    if(!Aggregator._handlers)
      throw new Error('Aggregator handlers not set')
    return Aggregator._handlers
  }

  static setHandlers(data:IFieldHandler[]){
    Aggregator._handlers = {}
    data.forEach( item => {
      Aggregator._handlers[item.name] = item.math
    })
    Aggregator.atomAggregator = new AtomAggregate(Aggregator.handlers)
  }

  static structureAfterFilter(struct: any){
    Object.values(struct).forEach( atom => {
      Aggregator.atomAggregator.aggregateFiltered(atom)
    })
  }

  static structure(struct: any, fields?: number[] | string[] ){
    let newStruct = JSON.parse( JSON.stringify(struct) )
    if(!fields || !fields.length){
      return Aggregator.allFields(newStruct)
    }
    return Aggregator.customFields(newStruct, fields)
  }

  private static allFields(struct: any){
    Object.values(struct).forEach( atom => {
      Aggregator.atomAggregator.aggregate(atom)
    })
    return struct
  }

  private static customFields(struct: any, fields: number[] | string[]){
    let res = {}
    for(let name in struct){
      let atom = struct[name]
      res[name] = Aggregator.atomAggregator.customFields(atom, fields)
    }
    return res
  }

  static atom(atom: any){
    return Aggregator.atomAggregator.aggregate(atom)
  }

  static field(field_name: string | number, values: number[]){
    return Aggregator.atomAggregator.aggregateField(field_name, values)
  }
}


class AtomAggregate {
  private  _handlers: any

  private get handlers(){
     return this._handlers
  }

  constructor( handlers: any ) {
    this._handlers = handlers
  }

  customFields(atom: any, fields: string[] | number[]){
    let newAtom = {}
    fields.forEach(field_name => {
      let handler_name = this.handlers[field_name]
      newAtom[field_name] = Operations.aggregate(handler_name, atom[field_name])
    })
    return newAtom
  }

  aggregateField(field_name: string | number, values: number[]){
    let handler_name = this.handlers[field_name]
    return  Operations.aggregate(handler_name, values)
  }

  aggregate(atom: any){
     for(let field_name in atom){
       let handler_name = this.handlers[field_name]
       atom[field_name] = Operations.aggregate(handler_name, atom[field_name])
     }
     return atom
  }

  aggregateFiltered(atom: any){
    for(let field_name in atom){
      let handler_name = this.handlers[field_name]
      atom[field_name] = Operations.aggregateFiltered(handler_name, atom[field_name])
    }
  }
}


class Operations {
  static aggregateFiltered(handler_name: string, values: number[] | number[][] ){
    return MatrixToVector.handlerAfterFilter(handler_name, values)
  }

  static aggregate(handler_name: string, values: number[] | number[][] ){
    let vtv = new VectorToValue()
    return vtv.handler(handler_name, values)
  }
}


class MatrixToVector {
  static handler(name: string, values: any[] ){
    let vtv: VectorToValue = new VectorToValue()
    if(name === ValueHandlers.last_sum)
      return   vtv.last(values)
    return values.map( val =>  vtv.handler(name, val) )
  }

  static handlerAfterFilter(name: string, values: any[] ){
    let vtv: VectorToValue = new VectorToValue()
    if(name === ValueHandlers.last_sum)
      return values.map( val =>  vtv.sum(val) )
    return values.map( val =>  vtv.handler(name, val) )
  }
}


class VectorToValue {
  private handlers =  {
    [ValueHandlers.sum] : this.sum,
    [ValueHandlers.max] : this.max,
    [ValueHandlers.min] : this.min,
    [ValueHandlers.min_nzero] : this.minNZero,
    [ValueHandlers.last_sum] : this.last
  }

  handler(name: string, values: any ){
    let executor =  this.handlers[name]
    if(!executor){
      return
    }
    return executor(values)
  }

  sum(values: number[]): number{
    if(!values.length)
      return 0
    return values.reduce((sum , current) => sum + current)
  }

  max(values: number[]): number{
    return Math.max(...values)
  }

  min(values: number[]): number{
    return Math.min(...values)
  }

  minNZero(values: number[]): number{
    let minValue: number =  Math.min( ...values.filter( i => i))
    // @ts-ignore
    return  (minValue != 'Infinity') ? minValue : 0
  }

  last(values: any[]):any{
    if(values.length) return <number>values.pop();
    else return 0;
  }
}
