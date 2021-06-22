export namespace ICommonDepartment {

    export interface IDepartmentRequest {
        readonly data: number | number[] | ICreateStruct[] |  IDepartStruct[] | IAccount | IGet | IEmployeesStruct
    }

    export interface IAccount {
        readonly account_id: number
    }

    export interface IGet {
        readonly id: number
    }

    export interface ICreateStruct {
        readonly account_id: number
        readonly title: string
    }

    export interface IUpdateStruct extends ICreateStruct{
        readonly id: number
        readonly head_id: number | null
        readonly parent_department_id: number | null
    }

    export interface IDepartStruct extends IUpdateStruct{
        readonly employees_id: Array<number>
    }

    export interface IEmployeesStruct {
        readonly department_id: number
        readonly employees_id: Array<number>
    }

    export interface IBaseDepartment {
        readonly baseModel: IUpdateStruct
        readonly account_id: number
        readonly id: number
    }

    export interface IDepartmentAction {
        changeTitle(title: string): Promise<void>
        changeHead(id: number): Promise<void>
        changeHeadDepartment(id: number): Promise<void>
        createEmployeesLinks(ids: number[]): Promise<void>
        deleteEmployeesLinks(ids: number[]): Promise<void>
    }

    export  class BaseDepartment implements IBaseDepartment {
        readonly account_id: number;
        readonly id: number;
        protected _employees_id: Array<number> = []
        protected _title: string = "Название отдела"
        protected _head_id: number | null = null
        protected _parent_department_id: number | null = null


        constructor( model: any) {
            this.account_id = model.account_id
            this.id = model.id
            this._title = model.title
            this._employees_id = model.employees_id || []
            this._head_id = model.head_id || null
            this._parent_department_id = model.parent_department_id || null
        }

        get title(): string{
            return this._title
        }

        changeTitle(title: string){
            this._title = title
        }

        get headId(): number | null{
            return this._head_id
        }

        get parentDepartmentId(): number | null {
            return this._parent_department_id
        }

        get employeesIdBase(): number[]{
            return this._employees_id
        }

        setEmployeesId(ids:number[]){
            this._employees_id = ids
        }

        get baseModel():  IDepartStruct{
            return {
                account_id: this.account_id,
                id: this.id,
                title: this.title,
                head_id: this._head_id,
                parent_department_id: this._parent_department_id,
                employees_id: this._employees_id
            }
        }
    }

}