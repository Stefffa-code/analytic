import { IndexedDate } from "./IndexedDate";
export class UnfoldByDate {
    constructor(structure, startDate, fields) {
        this._structure = structure;
        this._fields = fields;
        this._startDate = startDate;
    }
    static byFields(structure, fields, startDate) {
        let converter = new UnfoldByDate(structure, startDate, fields);
        return converter.unfoldByFields();
    }
    static byGroups(structure, fields, startDate) {
        let converter = new UnfoldByDate(structure, startDate, fields);
        return converter.unfoldByGroups();
    }
    static unfoldAtom(atom, startDate) {
        let converter = new UnfoldByDate(atom, startDate, []);
        return converter.unfoldAtom(atom);
    }
    get structure() {
        return this._structure;
    }
    get fields() {
        return this._fields;
    }
    get startDate() {
        return this._startDate;
    }
    unfoldByFields() {
        let result = {};
        this.fields.forEach(field => {
            result[field] = this.unfoldOneField(field);
        });
        return result;
    }
    unfoldOneField(field) {
        let length = this.getLengthField(Object.values(this.structure)[0]);
        if (!length)
            return;
        let result = [];
        let group_names = Object.keys(this.structure);
        for (let i = 0; i < length; i++) {
            let item = this.unfoldFieldByOneDay(i, field, group_names);
            result.push(item);
        }
        return result;
    }
    unfoldFieldByOneDay(index, field, group_names) {
        let item = {};
        item.date = IndexedDate.toDate(this.startDate, index).toDate();
        group_names.forEach(name => {
            item[name] = this.structure[name][field][index];
        });
        return item;
    }
    getLengthField(atom) {
        // @ts-ignore
        let res = Object.values(atom)[0];
        return res.length;
    }
    unfoldByGroups() {
        let result = {};
        Object.keys(this.structure).forEach(group_name => {
            let atom = this.structure[group_name];
            result[group_name] = this.unfoldOneGroup(atom);
        });
        return result;
    }
    unfoldOneGroup(groupAtom) {
        let length = this.getLengthField(groupAtom);
        if (!length)
            return;
        let result = [];
        for (let i = 0; i < length; i++) {
            result.push(this.unfoldGroupByOneDay(i, groupAtom));
        }
        return result;
    }
    unfoldGroupByOneDay(index, atom) {
        let item = {};
        item.date = IndexedDate.toDate(this.startDate, index).toDate();
        this.fields.forEach(field => {
            item[field] = atom[field][index];
        });
        return item;
    }
    unfoldAtom(atom) {
        let length = this.getLengthField(atom);
        if (!length)
            return;
        let result = [];
        for (let i = 0; i < length; i++) {
            result.push(this.unfoldAtomInOneDay(i, atom));
        }
        return result;
    }
    unfoldAtomInOneDay(index, atom) {
        let item = {};
        item.date = IndexedDate.toDate(this.startDate, index).toDate();
        Object.keys(atom).forEach(field => {
            item[field] = atom[field][index];
        });
        return item;
    }
}
//# sourceMappingURL=UnfoldByDate.js.map