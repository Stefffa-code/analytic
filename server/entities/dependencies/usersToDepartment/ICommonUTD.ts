export namespace IUsersToDepartment{

    export interface IChangeUTD {
        department_id: number,
        employees_id: number[]
    }

    export interface IItemUTD {
        department_id: number,
        user_id: number
    }

}
