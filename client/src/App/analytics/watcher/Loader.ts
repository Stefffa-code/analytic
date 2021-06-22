import * as axios from "../../core/axios";



export class Loader {
  private static _self: Loader
  static get self(): Loader {
    if(Loader._self) return Loader._self
    Loader._self = new Loader()
    return Loader._self
  }

  private _baseUrl: string = '/api/analytics'

  get baseUrl(){
    return this._baseUrl
  }

  get urlAll(){
    return this._baseUrl + '/all'
  }

  get urlFrom(){
    return this._baseUrl + '/from'
  }


  async loadAllMetrics(account_id: number): Promise<any>{
    return await axios.getLong(this.urlAll, {account_id}, 240000)
  }

  async loadSlice(account_id: number, start_date: number):Promise<any>{
    return await axios.getLong(this.urlFrom, {account_id, start_date}, 240000)
  }

}
