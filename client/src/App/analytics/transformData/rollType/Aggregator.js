import { ValueHandlers } from "../../../types/enums";
export class Aggregator {
    static get handlers() {
        if (!Aggregator._handlers)
            throw new Error('Aggregator handlers not set');
        return Aggregator._handlers;
    }
    static setHandlers(data) {
        Aggregator._handlers = {};
        data.forEach(item => {
            Aggregator._handlers[item.name] = item.math;
        });
        Aggregator.atomAggregator = new AtomAggregate(Aggregator.handlers);
    }
    static structureAfterFilter(struct) {
        Object.values(struct).forEach(atom => {
            Aggregator.atomAggregator.aggregateFiltered(atom);
        });
    }
    static structure(struct, fields) {
        let newStruct = JSON.parse(JSON.stringify(struct));
        if (!fields || !fields.length) {
            return Aggregator.allFields(newStruct);
        }
        return Aggregator.customFields(newStruct, fields);
    }
    static allFields(struct) {
        Object.values(struct).forEach(atom => {
            Aggregator.atomAggregator.aggregate(atom);
        });
        return struct;
    }
    static customFields(struct, fields) {
        let res = {};
        for (let name in struct) {
            let atom = struct[name];
            res[name] = Aggregator.atomAggregator.customFields(atom, fields);
        }
        return res;
    }
    static atom(atom) {
        return Aggregator.atomAggregator.aggregate(atom);
    }
    static field(field_name, values) {
        return Aggregator.atomAggregator.aggregateField(field_name, values);
    }
}
class AtomAggregate {
    constructor(handlers) {
        this._handlers = handlers;
    }
    get handlers() {
        return this._handlers;
    }
    customFields(atom, fields) {
        let newAtom = {};
        fields.forEach(field_name => {
            let handler_name = this.handlers[field_name];
            newAtom[field_name] = Operations.aggregate(handler_name, atom[field_name]);
        });
        return newAtom;
    }
    aggregateField(field_name, values) {
        let handler_name = this.handlers[field_name];
        return Operations.aggregate(handler_name, values);
    }
    aggregate(atom) {
        for (let field_name in atom) {
            let handler_name = this.handlers[field_name];
            atom[field_name] = Operations.aggregate(handler_name, atom[field_name]);
        }
        return atom;
    }
    aggregateFiltered(atom) {
        for (let field_name in atom) {
            let handler_name = this.handlers[field_name];
            atom[field_name] = Operations.aggregateFiltered(handler_name, atom[field_name]);
        }
    }
}
class Operations {
    static aggregateFiltered(handler_name, values) {
        return MatrixToVector.handlerAfterFilter(handler_name, values);
    }
    static aggregate(handler_name, values) {
        let vtv = new VectorToValue();
        return vtv.handler(handler_name, values);
    }
}
class MatrixToVector {
    static handler(name, values) {
        let vtv = new VectorToValue();
        if (name === ValueHandlers.last_sum)
            return vtv.last(values);
        return values.map(val => vtv.handler(name, val));
    }
    static handlerAfterFilter(name, values) {
        let vtv = new VectorToValue();
        if (name === ValueHandlers.last_sum)
            return values.map(val => vtv.sum(val));
        return values.map(val => vtv.handler(name, val));
    }
}
class VectorToValue {
    constructor() {
        this.handlers = {
            [ValueHandlers.sum]: this.sum,
            [ValueHandlers.max]: this.max,
            [ValueHandlers.min]: this.min,
            [ValueHandlers.min_nzero]: this.minNZero,
            [ValueHandlers.last_sum]: this.last
        };
    }
    handler(name, values) {
        let executor = this.handlers[name];
        if (!executor) {
            return;
        }
        return executor(values);
    }
    sum(values) {
        if (!values.length)
            return 0;
        return values.reduce((sum, current) => sum + current);
    }
    max(values) {
        return Math.max(...values);
    }
    min(values) {
        return Math.min(...values);
    }
    minNZero(values) {
        let minValue = Math.min(...values.filter(i => i));
        // @ts-ignore
        return (minValue != 'Infinity') ? minValue : 0;
    }
    last(values) {
        if (values.length)
            return values.pop();
        else
            return 0;
    }
}
//# sourceMappingURL=Aggregator.js.map