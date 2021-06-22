import * as axios from "./axios";


export class FrontLogger {
  static async write(account_id: number,  message: any){
    await axios.send(FrontLogger.path, {account_id, message})
  }

  private static get path(){
    return 'api/logs'
  }
}
