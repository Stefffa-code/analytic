import moment from "moment";
export class Dates {
    static toSec(date) {
        let dateValue = date.valueOf();
        return Math.trunc(dateValue / 86400000) * 86400;
    }
    static diffInDays(date_start, date_end) {
        let start_sec = Dates.toSec(date_start);
        let end_sec = Dates.toSec(date_end);
        return Math.round((end_sec - start_sec) / (60 * 60 * 24));
    }
    static difSecsInDays(date_start_sec, date_end_sec) {
        return Math.round((date_end_sec - date_start_sec) / (60 * 60 * 24));
    }
    static get yesterdaySec() {
        let yesterday = moment().subtract(1, 'days');
        return Dates.toSec(yesterday);
    }
    static daySec(num) {
        let yesterday = moment().add(num, 'days');
        return Dates.toSec(yesterday);
    }
    static get lengthDayInSecs() {
        return 24 * 60 * 60;
    }
    static secsToDate(secs) {
        return moment(secs * 1000);
    }
}
//# sourceMappingURL=Dates.js.map