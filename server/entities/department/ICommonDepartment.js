export var ICommonDepartment;
(function (ICommonDepartment) {
    class BaseDepartment {
        constructor(model) {
            this._employees_id = [];
            this._title = "Название отдела";
            this._head_id = null;
            this._parent_department_id = null;
            this.account_id = model.account_id;
            this.id = model.id;
            this._title = model.title;
            this._employees_id = model.employees_id || [];
            this._head_id = model.head_id || null;
            this._parent_department_id = model.parent_department_id || null;
        }
        get title() {
            return this._title;
        }
        changeTitle(title) {
            this._title = title;
        }
        get headId() {
            return this._head_id;
        }
        get parentDepartmentId() {
            return this._parent_department_id;
        }
        get employeesIdBase() {
            return this._employees_id;
        }
        setEmployeesId(ids) {
            this._employees_id = ids;
        }
        get baseModel() {
            return {
                account_id: this.account_id,
                id: this.id,
                title: this.title,
                head_id: this._head_id,
                parent_department_id: this._parent_department_id,
                employees_id: this._employees_id
            };
        }
    }
    ICommonDepartment.BaseDepartment = BaseDepartment;
})(ICommonDepartment || (ICommonDepartment = {}));
//# sourceMappingURL=ICommonDepartment.js.map