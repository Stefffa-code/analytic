import {IUsersToDepartment} from "./ICommonUTD";
import IChangeUTD = IUsersToDepartment.IChangeUTD;
import {UserToDepartmentsSchema} from "../../../../db/models/pragma_users/index";
import {users_db} from "../../../../db/utils/ConnectDB";
import IItemUTD = IUsersToDepartment.IItemUTD;

const { Op, query, QueryTypes } = require('sequelize');




export interface IStatusToDepartmentFabric {
    getAll(account_id: number ): Promise<IChangeUTD[]>
    createLinks(structs:IChangeUTD[]): Promise<any>
    destroyLinks(structs:IChangeUTD[]): Promise<any>
}

export class BDepartmentUsersFabric implements IStatusToDepartmentFabric {
    private static _self: BDepartmentUsersFabric

    static get self(): BDepartmentUsersFabric {
        if(BDepartmentUsersFabric._self) return BDepartmentUsersFabric._self;
        BDepartmentUsersFabric._self = new BDepartmentUsersFabric()
        return BDepartmentUsersFabric._self
    }

    async  getAll(account_id: number): Promise<IChangeUTD[]>{
         let res = await users_db.query( `SELECT * 
            FROM user_to_departments
            where department_id in ( SELECT id
                           from departments
                           where departments.account_id = ${account_id})
        `,{
             nest: true,
             type: QueryTypes.SELECT
        })
        if(!res)
            return []
        return this._shapeToChangeUTD(res)
    }

    private _shapeToChangeUTD(data: IItemUTD[]): IChangeUTD[]{
        let uniqDepartmentIds = new Set(data.map(i => i.department_id))
        let result:IChangeUTD[] = []

        for( let department_id of uniqDepartmentIds){
            let items = data.filter(i => i.department_id === department_id)
            result.push({
                department_id,
                employees_id: items.map(i => i.user_id)
            })
        }
        return result
    }

    async  createLinks(structs:IChangeUTD[]): Promise<any>{
        return await Promise.all(structs.map( item => this._addStruct(item)))
    }

    private async _addStruct(struct: IChangeUTD){
        return await Promise.all(struct.employees_id.map( user_id => {
            UserToDepartmentsSchema.create({
                department_id: struct.department_id,
                user_id,
            })
        }) )
    }

    async  destroyLinks(structs:IChangeUTD[]): Promise<any>{
        return await Promise.all(structs.map( struct => this._destroyStruct(struct)))
    }

    private async _destroyStruct(struct:IChangeUTD){
        return await UserToDepartmentsSchema.destroy({
            where:{ [Op.and]:[
                    { department_id: struct.department_id },
                    { user_id: { [Op.in]: [...struct.employees_id] },}
                ]}
        })
    }
}

