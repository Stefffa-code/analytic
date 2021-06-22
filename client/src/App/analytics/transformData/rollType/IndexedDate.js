import moment from "moment";
import { Dates } from "../../../core/Dates";
export class IndexedDate {
    static toIndex(startDateSec, date) {
        let endSec = Dates.toSec(date);
        let diff = Dates.difSecsInDays(startDateSec, endSec);
        return diff;
    }
    static toDate(startDateSec, index) {
        if (typeof startDateSec === 'number') {
            return moment(startDateSec * 1000).add((index), 'day');
        }
        let date = moment(startDateSec.valueOf());
        return date.add((index), 'day');
    }
}
//# sourceMappingURL=IndexedDate.js.map