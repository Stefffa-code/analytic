export class IndicatorFilter {
    constructor(metricTree, filter, departments) {
        this._users_id = [];
        this._pipelines = [];
        // @ts-ignore
        this._range = {};
        this._departments = [];
        this._metric_tree = {};
        this._fields = [];
        this._metric_tree = metricTree;
        this._users_id = filter.users_id;
        this._pipelines = filter.pipelines;
        this.setRange(filter.range);
        this._departments = departments || [];
        this._fields = this.definedFields(metricTree);
    }
    static byUsers(metricTree, filter) {
        let filterMetric = new IndicatorFilter(metricTree, filter);
        return filterMetric.usersMetric();
    }
    static byPipelines(metricTree, filter) {
        let filterMetric = new IndicatorFilter(metricTree, filter);
        return filterMetric.pipelinesMetric();
    }
    static byDepartments(metricTree, filter, departments) {
        let filterMetric = new IndicatorFilter(metricTree, filter, departments);
        return filterMetric.departmentsMetric();
    }
    static total(metricTree, filter) {
        let filterMetric = new IndicatorFilter(metricTree, filter);
        return filterMetric.totalMetric();
    }
    get users() {
        return this._users_id;
    }
    get pipelines() {
        return this._pipelines;
    }
    get range() {
        return this._range;
    }
    get departments() {
        return this._departments;
    }
    get metricTree() {
        return this._metric_tree;
    }
    get fieldsName() {
        return this._fields;
    }
    setRange(range) {
        if (typeof range.start != 'number' || typeof range.end != 'number') {
            throw Error('The range must be in numbers!');
        }
        this._range.start = range.start;
        this._range.end = range.end;
    }
    definedFields(struct) {
        let userStruct = Object.values(struct)[0];
        let pipelineStruct = Object.values(userStruct)[0];
        let atom = Object.values(pipelineStruct)[0];
        return Object.keys(atom);
    }
    totalMetric() {
        if (!this.users.length || !this.pipelines.length)
            return;
        return this.toAllMetric();
    }
    departmentsMetric() {
        if (!this.users.length || !this.pipelines.length || !this.departments.length)
            return;
        return this.toDepartmentMetric();
    }
    usersMetric() {
        if (!this.users.length || !this.pipelines.length)
            return;
        return this.toUsersMetric(this.users);
    }
    pipelinesMetric() {
        if (!this.users.length || !this.pipelines.length)
            return;
        return this.toPipelinesMetric();
    }
    toDepartmentMetric() {
        let structure = {};
        this.departments.forEach(department => {
            structure[department.id] = this.toDepartmentAtom(department.users_id);
        });
        return structure;
    }
    toUsersMetric(users) {
        let structure = {};
        users.forEach(user => {
            let userTree = this.metricTree[user];
            if (userTree) {
                structure[user] = this.toUserAtom(userTree);
            }
        });
        return structure;
    }
    toPipelinesMetric() {
        let structure = {};
        let fields = this.pipelines.map(i => i.id);
        this.users.forEach(user => {
            let userTree = this.metricTree[user];
            if (userTree) {
                let pipelinesStructure = this.toPipelinesUserMetric(userTree);
                this.additionToStructure(structure, pipelinesStructure, fields);
            }
        });
        return structure;
    }
    toPipelinesUserMetric(userTree) {
        let struct = {};
        this.pipelines.forEach(pipeline => {
            let pipelineTree = userTree[pipeline.id];
            if (pipelineTree) {
                struct[pipeline.id] = this.toPipelineAtom(pipelineTree, pipeline.statuses_id);
            }
        });
        return struct;
    }
    toDepartmentAtom(users) {
        let departmentAtom = this.createEmptyAtom();
        let usersStruct = this.toUsersMetric(users);
        users.forEach(user => {
            let userAtom = usersStruct[user];
            if (userAtom) {
                this.unionAtoms(departmentAtom, userAtom);
            }
        });
        return departmentAtom;
    }
    toAllMetric() {
        let structure = {};
        let metricAtom = this.createEmptyAtom();
        this.users.forEach(user => {
            const start = new Date().getTime();
            let userTree = this.metricTree[user];
            if (userTree) {
                let userAtom = this.toUserAtom(userTree);
                this.unionAtoms(metricAtom, userAtom);
            }
            const end = new Date().getTime();
            console.log('toAllMetric', end - start);
        });
        structure.total = metricAtom;
        return structure;
    }
    toUserAtom(userThree) {
        let userAtom = this.createEmptyAtom();
        this.pipelines.forEach(pipeline => {
            let pipelineTree = userThree[pipeline.id];
            if (pipelineTree) {
                let pipelineAtom = this.toPipelineAtom(pipelineTree, pipeline.statuses_id);
                this.unionAtoms(userAtom, pipelineAtom);
            }
        });
        return userAtom;
    }
    toPipelineAtom(pipelineTree, statuses) {
        let pipelineAtom = this.createEmptyAtom();
        statuses.forEach(status => {
            let atom = pipelineTree[status];
            if (atom) {
                let cutAtom = this.cutRangeAtom(atom);
                this.unionAtoms(pipelineAtom, cutAtom);
            }
        });
        return pipelineAtom;
    }
    createEmptyAtom() {
        let atom = {};
        this.fieldsName.forEach(field => {
            atom[field] = [];
        });
        return atom;
    }
    cutRangeAtom(atom) {
        // let fieldsName = Object.keys(ValueName)
        let cutedAtom = {};
        this.fieldsName.forEach(field => {
            cutedAtom[field] = this.cutRangeInField(atom, field);
        });
        return cutedAtom;
    }
    cutRangeInField(atom, field) {
        return (field in atom) ? this.cutRange(atom[field]) : [];
    }
    cutRange(data) {
        let groups = [];
        let end = (data.length < this.range.end) ? data.length : this.range.end + 1;
        for (let i = this.range.start; i < end; i++) {
            groups.push([data[i]]);
        }
        return groups;
    }
    unionAtoms(atom_1, atom_2) {
        // let fieldsName = Object.keys(ValueName)
        this.fieldsName.forEach(field => {
            if (atom_2[field].length) {
                this.addition(atom_1[field], atom_2[field], field);
            }
        });
    }
    addition(to, from, valueName) {
        if (!to.length) {
            to.push(...from);
            return;
        }
        for (let i = 0; i < to.length; i++) {
            to[i].push(...from[i]);
            // let values =  to[i].concat(from[i])
            // to[i] = [ FieldAggregate.joinFiltratedValuesToField(values, valueName)]
        }
    }
    additionToStructure(to, from, fields) {
        fields.forEach(field => {
            let atomTo = to[field];
            let atomFrom = from[field];
            if (!atomFrom)
                return;
            if (!atomTo) {
                atomTo = this.createEmptyAtom();
                to[field] = atomTo;
            }
            this.unionAtoms(atomTo, atomFrom);
        });
    }
}
//# sourceMappingURL=IndicatorFilter.js.map