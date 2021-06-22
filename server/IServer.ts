import {ICommonDepartment} from "./entities/department/ICommonDepartment";

export namespace IServer {
    import IDepartmentRequest = ICommonDepartment.IDepartmentRequest;

    export interface ILinkDepartmentsUsers {
        readonly department_id: number
        readonly users_id: Array<number>
    }

    export interface ILinkDepartmentsUsers {
        readonly department_id: number
        readonly users_id: Array<number>
    }

    export interface IQuery {
        readonly data?: ILinkDepartmentsUsers | number[] | any | IDepartmentRequest
        readonly filter?: any
    }

    export interface IRequest{
        readonly url: IUrl
        readonly query: IQuery
    }

    export interface IUrl {
        readonly type: 'analytics'|'entities'|'dependencies'
        readonly method: string
    }

    export interface IAnalyticUrl extends IUrl{
        readonly type: 'analytics'
        readonly method: string
    }

    export interface IEntitiesUrl extends IUrl{
        readonly type: 'entities'
        readonly entity: string
        readonly method: string
    }

    export interface IDependenciesUrl extends IUrl{
        readonly type: 'dependencies'
        readonly entity: string
        readonly method: string
    }

    export interface IResponse {
        readonly result: any
    }

    export class Response {
        readonly result: any
        constructor(result: any) {
            this.result = result
        }
    }

    export interface IError {
        readonly error: true
        readonly message: string
        readonly code: number
        readonly data: any
    }

    export class Error implements IError{
        readonly error: true = true
        readonly message: string
        readonly code: number
        readonly data: any

        constructor(message: string, code: number, data: any = {}) {
            this.message = message
            this.code = code
            this.data = data
        }

        toString(): string {
            return JSON.stringify({message: this.message, code: this.code, data: this.data})
        }
    }

    export class Errors{
        static readonly innerErrorCode:number = 900

        static readonly invalidQueryUrlCode:number = 1000
        static readonly invalidUrlHandlerCode:number = 1001
        static readonly invalidRequestCode:number = 1002

        static readonly errorDbCode:number = 1201

        static readonly invalidValidationCode:number = 1700

        static readonly notFoundForUpdateDBCode:number = 1801
        static readonly notFoundForDeleteDBCode:number = 1802
        static readonly notSaveInDbCode:number = 1803


        static createError(message: string, code: number): IError {
            return new Error(message, code)
        }

        static innerError(message: string): IError {
            return new Error( 'ERROR:  ' + message , this.innerErrorCode)
        }

        static errorDb(message: string): IError {
            return new Error( message, this.errorDbCode)
        }

        static invalidQueryUrl(message: string   ): IError {
            return new Error( message, this.invalidQueryUrlCode)
        }

        static invalidUrlHandler(): IError {
            return new Error(  'Do not figure out url method handler' , this.invalidUrlHandlerCode)
        }



        static invalidPhone(): IError {
            return new Error('Invalid phone data', this.invalidValidationCode)
        }

        static ValidationError(message?: string): IError {
            return new Error('Input data did not pass validation. ' + message, this.invalidValidationCode)
        }

        static invalidEmail(): IError {
            return new Error('', this.invalidValidationCode)
        }

        static invalidID(): IError {
            return new Error('Invalid id', this.invalidValidationCode)
        }

        static invalidRequest(message: string): IError {
            return new Error('Invalid request' + message, this.invalidRequestCode)
        }

        static notFoundForUpdateDB(tableName: string): IError {
            return new Error('Not found object for update in table ' + tableName, this.notFoundForUpdateDBCode)
        }

        static notFoundForDeleteDB(tableName: string): IError {
            return new Error('Not found object for delete in table ' + tableName, this.notFoundForDeleteDBCode)
        }

        static SaveInDbError(tableName: string): IError {
            return new Error('Failed to save changes in the database in table: ' + tableName, this.notSaveInDbCode)
        }



    }
}