export namespace ICommonUser {

    export interface IFindUser{
        user_id: number
    }

    export interface IUser {
        readonly id: number,
        name: string,
        surname?: string,
        middle_name?: string,
        readonly email: string,
        confirm_email: boolean,
        readonly phone: string | null,
        lang: string
    }

    export interface IHiddenLogin {
        find: boolean
        phone: string | null,
        email: string
    }
}