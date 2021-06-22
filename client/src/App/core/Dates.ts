import moment, {Moment} from "moment";

export class Dates {
  static toSec(date:Moment):number{
    let dateValue = date.valueOf()
    return Math.trunc(dateValue / 86400000) * 86400
  }

  static diffInDays(date_start:Moment, date_end: Moment){
    let start_sec = Dates.toSec(date_start)
    let end_sec = Dates.toSec(date_end)
    return  Math.round( (end_sec - start_sec) / (60*60*24) );
  }

  static difSecsInDays(date_start_sec:number, date_end_sec: number){
    return  Math.round( (date_end_sec - date_start_sec) / (60*60*24) );
  }

  static get yesterdaySec(): number{
    let yesterday = moment().subtract(1, 'days')
    return Dates.toSec(yesterday)
  }

  static daySec(num: number): number{
    let yesterday = moment().add(num, 'days')
    return Dates.toSec(yesterday)
  }

  static get lengthDayInSecs(): number{
    return 24 * 60 * 60
  }

  static secsToDate(secs: number):Moment{
     return moment(secs * 1000)
  }
}
