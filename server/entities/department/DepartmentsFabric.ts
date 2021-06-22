import {DepartmentsSchema } from "../../../db/models/pragma_users/index";
import {ICommonDepartment, } from "./ICommonDepartment";
const { Op, query, QueryTypes } = require('sequelize');



export namespace IBDepartmentsFabric {
    import ICreateStruct = ICommonDepartment.ICreateStruct;
    import BaseDepartment = ICommonDepartment.BaseDepartment;
    import IUpdateStruct = ICommonDepartment.IUpdateStruct;
    import IDepartStruct = ICommonDepartment.IDepartStruct;


    export interface IDepartmentsFabric {
        getAll(account_id?: number): Promise<Array<Department>>
        remove(ids: Array<number>): Promise<void>
        update(struct: Array<IUpdateStruct> | Department[]): Promise<Array<IUpdateStruct>> | Promise<void>
        create(struct: Array<ICreateStruct> | Department[]): Promise<Array<IUpdateStruct>>
    }


    export class BDepartmentsFabric implements IDepartmentsFabric{

        private static inst: BDepartmentsFabric
        static get self(): BDepartmentsFabric {
            if(BDepartmentsFabric.inst) return BDepartmentsFabric.inst
            BDepartmentsFabric.inst = new BDepartmentsFabric()
            return BDepartmentsFabric.inst
        }

        async getAll(account_id?: number): Promise<Array<Department>> {

            return await DepartmentsSchema.findAll({
                where:{ account_id},
                raw: true,
            })
        }

        async create(struct: Array<ICreateStruct>): Promise<Array<IUpdateStruct>> {
            return await Promise.all(struct.map(model => this._saveOne(model)))
        }

        private async _saveOne(model: ICreateStruct): Promise<IUpdateStruct> {
            let saved = await DepartmentsSchema.create({
                title: model.title,
                account_id: model.account_id
            })
            saved.dataValues.users_id = []
            let depart = new Department(this, saved.dataValues)
            return depart.baseModel
        }

        async update(struct: Array<IUpdateStruct>): Promise<Array<IDepartStruct>> {
            return await Promise.all(struct.map(model => this._updateOne(model)) )
        }

        private async _updateOne(model: IUpdateStruct): Promise<IDepartStruct> {
            let m = await DepartmentsSchema.findByPk(model.id)
            m.title = model.title
            m.head_id = model.head_id
            m.parent_department_id = model.parent_department_id
            let updated =  await m.save()
            let depart =  new Department(this, updated.dataValues)
            return depart.baseModel
        }

        async remove(ids: Array<number>): Promise<any> {
            await Promise.all(ids.map(id => this._removeOne(id)) )
            return {message: 'Departments removed'}
        }

        private async _removeOne(id: number): Promise<void> {
            let model = await DepartmentsSchema.findByPk(id)
            await model.destroy()
        }
    }



    class Department extends BaseDepartment {
        private fabric: BDepartmentsFabric
        constructor(fabric: BDepartmentsFabric, model: any ) {
            super(model)
            this.fabric = fabric
        }

        get baseModel():IDepartStruct {
            return {
                account_id: this.account_id,
                id: this.id,
                title: this._title,
                head_id: this._head_id,
                parent_department_id: this._parent_department_id,
                employees_id: this._employees_id
            }
        }

    }

}