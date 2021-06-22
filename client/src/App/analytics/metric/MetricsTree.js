import { Dates } from "../../core/Dates";
export class MetricsTree {
    constructor() {
        this._field_handlers = [];
    }
    static get self() {
        if (MetricsTree._self)
            return MetricsTree._self;
        MetricsTree._self = new MetricsTree();
        return MetricsTree._self;
    }
    static validateTree(tree, range_sec) {
        let days = Dates.difSecsInDays(range_sec.start, range_sec.end) + 1;
        let countValues = MetricsTree.lengthValues(tree);
        if (days !== countValues) {
            throw Error('ValidationMetricsTreeError: The number of values and days does not match');
        }
        return true;
    }
    static lengthValues(tree) {
        let length = 0;
        Object.values(tree).forEach((indicator) => {
            Object.values(indicator).forEach((user) => {
                Object.values(user).forEach((pipeline) => {
                    Object.values(pipeline).forEach((status) => {
                        Object.values(status).forEach((field) => {
                            if (!length)
                                length = field.length;
                            if (length != field.length)
                                throw new Error('ValidationMetricsTreeError: Not all fields of an atom have the same number');
                        });
                    });
                });
            });
        });
        return length;
    }
    get fieldHandlers() {
        return this._field_handlers;
    }
    get startDateSecForAddSlice() {
        return this.endDateSec + Dates.lengthDayInSecs;
    }
    get tree() {
        return this._tree;
    }
    get startDateSec() {
        return this._start_date_sec;
    }
    get endDateSec() {
        return this._end_date_sec;
    }
    get range() {
        return {
            start: this.startDateSec,
            end: this.endDateSec
        };
    }
    metricBranch(name) {
        return JSON.parse(JSON.stringify(this.tree[name]));
    }
    setData(tree, range, handlers) {
        this._tree = tree;
        this._end_date_sec = range.end;
        this._start_date_sec = range.start;
        this._field_handlers = handlers;
    }
    addBranches(branchesTree) {
        Object.assign(this.tree, branchesTree);
    }
    addSlice(slice, range) {
        MetricsTree.validateTree(slice, range);
        let validDate = this.validateDate(range.start);
        if (validDate) {
            this._end_date_sec = range.end;
            this.joinSlice(slice);
        }
        else {
            throw new Error("not valid start date range for slice ");
        }
    }
    validateDate(start_added_range_sec) {
        return start_added_range_sec === this.startDateSecForAddSlice;
    }
    joinSlice(slice) {
        console.log('add slice');
        for (let indicator in this.tree) {
            let indicatorBranch = this.tree[indicator];
            for (let user in indicatorBranch) {
                let userBranch = indicatorBranch[user];
                for (let pipeline in userBranch) {
                    let pipelineBranch = userBranch[pipeline];
                    for (let status in pipelineBranch) {
                        let sliceAtom = slice[indicator][user][pipeline][status];
                        this.additionToAtom(pipelineBranch[status], sliceAtom);
                    }
                }
            }
        }
    }
    additionToAtom(to, from) {
        if (!from)
            throw new Error(' No atom found in slice');
        for (let field in to) {
            let tofield = to[field];
            let fromfield = from[field];
            tofield.push(...fromfield);
        }
    }
}
//# sourceMappingURL=MetricsTree.js.map