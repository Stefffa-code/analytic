export namespace ICommonSTD {


    export interface IItemSTD {
        readonly department_id: number,
        status_id: number,
        name?: string ,
    }

    export interface IChangesSTD {
        readonly department_id: number,
        statuses_id: number[]
    }


    export interface IFabricDataSTD {
        account_id: number,
        structs: IChangesSTD[] | IItemSTD[]
    }




    export interface ITestItemSTD {
        account_id: number,
        name: string | null,
        department_id: number,
        status_id: number
    }

    export interface ITestChangesSTD {
        account_id: number,
        department_id: number,
        statuses_id: number[]
    }

}