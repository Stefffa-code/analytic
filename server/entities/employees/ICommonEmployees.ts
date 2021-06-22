export  namespace ICommonEmployees{
    export interface IEmployee {
        id: number
        name: string
        email: string | null
        confirm_email: boolean
        phone: string | null
        access: string | null
    }

}