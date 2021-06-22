import {ICommonSTD} from "./ICommonSTD";
import IChangesSTD = ICommonSTD.IChangesSTD;
import {StatusToDepartmentSchema} from "../../../../db/models/pragma_kpi/index";
import {IServer} from "../../../IServer";
import Response = IServer.Response;
import IFabricDataSTD = ICommonSTD.IFabricDataSTD;
const { Op, query, QueryTypes } = require('sequelize');


export interface IStatusToDepartmentFabric {
    getAll(account_id: number ): Promise<IChangesSTD[]>
    createDepartmentsLinks(data: IFabricDataSTD ): Promise<Response>
    deleteStatuses(data: IFabricDataSTD): Promise<Response>
    updateItemsName(data: IFabricDataSTD ): Promise<Response>
}


export class BStatusesToDepartmentFabric implements  IStatusToDepartmentFabric{
    private static _self: BStatusesToDepartmentFabric

    static get self(): BStatusesToDepartmentFabric {
        if(BStatusesToDepartmentFabric._self) return BStatusesToDepartmentFabric._self;
        BStatusesToDepartmentFabric._self = new BStatusesToDepartmentFabric()
        return BStatusesToDepartmentFabric._self
    }

    async  getAll(account_id: number): Promise<IChangesSTD[]>{
        let res = await StatusToDepartmentSchema.findAll({where:{account_id}})
        return this._shapingToChangesSTDArr(res)
    }

    private _shapingToChangesSTDArr(data: any): IChangesSTD[]{
        let dep: number[] = data.map((d: any) => d.department_id)
        let uniqDepartments: number[] = [...new Set(dep)]

        return uniqDepartments.map(department_id  => {
            return {
                account_id: data[0].account_id,
                department_id: department_id,
                statuses_id: findStatusesId(department_id, data)
            }
        })

        function findStatusesId(department_id: number, data: any): number[] {
            let items = data.filter( (i: any) => i.department_id === department_id)
            return items.map( (i:any) => i.status_id)
        }
    }

    async createDepartmentsLinks(data: IFabricDataSTD): Promise<any> {
        // @ts-ignore
        let result = await  Promise.all(data.structs.map( (struct:IChangesSTD) =>  this._createLinks(struct, data.account_id)))
        return result
    }

    private async _createLinks(struct: IChangesSTD, account_id: number): Promise<any> {
        return await Promise.all(struct.statuses_id.map( id => this._addOne(account_id, struct.department_id, id )))
    }

    private async _addOne(account_id: number, department_id:number, status_id:number):  Promise<any>{
       return StatusToDepartmentSchema.create({
           department_id, status_id, account_id
       });
    }

    async deleteStatuses(data: IFabricDataSTD  ): Promise<any>{
        // @ts-ignore
        return await Promise.all(data.structs.map( (item: IChangesSTD) => this._deleteOne(item)));
    }

    private async _deleteOne(struct: IChangesSTD): Promise<any>{
        await StatusToDepartmentSchema.destroy({
            where: {
                [Op.and]: [
                    // {account_id: struct.account_id},
                    {department_id: struct.department_id},
                    { status_id: { [Op.in]: struct.statuses_id } }
                ]
            }
        })
    }

    async updateItemsName(data: IFabricDataSTD ): Promise<any> {
        // return await Promise.all(data.structs.map( (item: IItemSTD) => this._updateOne(item)));
    }

    // private async _updateOne(item: IItemSTD) {
    //     return await StatusToDepartmentSchema.update(
    //         {name: item.name},
    //         {  where: {
    //             [Op.and]: [
    //                 // {account_id: item.account_id},
    //                 {department_id: item.department_id},
    //                 { status_id: item.status_id }
    //                 ]
    //             }
    //         }
    //     )
    // }

}