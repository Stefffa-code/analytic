import {IVueStage} from "../../../../segment/FStageFabric";
import {IVuePipelines} from "../../../../segment/FSegmentFabric";
import {IDepartmentsFabricSpace} from "../../../FDepartmentsFabric";
import FSegmentFabric = IVuePipelines.FSegmentFabric;
import Status = IVueStage.Status;
import FDepartmentsFabric = IDepartmentsFabricSpace.FDepartmentsFabric;
import Department = IDepartmentsFabricSpace.Department;
import {colors} from "../../../../../../constant/const";


interface IDropStatus{
  id: number,
  name: string,
  short_name: string,
  color: string,
  pipeline_id: number,
  pipeline_name: string ,
  pipeline_name_short: string,
  type: 'status',
}

interface IDropPipeline {
  type: 'pipeline',
  id: number,
  name: string,
  statuses: IDropStatus[]
}

interface IDropDepartment {
  id: number,
  name: string,
  statuses: IDropStatus[],
  department: Department
}



export class DropScene   {
  private static  _self
  static get self(){
    if(DropScene._self)
      return DropScene._self
    DropScene._self = new DropScene()
    return DropScene._self
  }

  private _pipelines: IDropPipeline[] = []
  private _departments: IDropDepartment[] = []

  get pipelines(){
    return this._pipelines
  }
  setPipelines(pipelines: IDropPipeline[]){
    this._pipelines = pipelines
  }

  get departments(){
    return this._departments
  }

  setDepartments(departments: IDropDepartment[]){
    this._departments = departments
  }

  constructor() {
    this._loadPipelines()
    this._loadDepartments()
  }

  private  _loadPipelines(){
    this._pipelines = FSegmentFabric.self.pipelines.map( (item ) => {
      return {
        id: item.id,
        name: item.name,
        type: 'pipeline',
        statuses: this._dropStatuses( item.statuses, item.name )
      }
    })
  }

  private _dropStatuses(statuses: Status[], pipeline_name?: string): IDropStatus[]{
    return statuses.map( (item, index) => {
      let pipName = pipeline_name ? pipeline_name : FSegmentFabric.self.find(item.pipeline_id).name
      return {
        id: item.id,
        name: item.name,
        short_name:this._cutText(17, item.name),
        color: colors[index],
        pipeline_id: item.pipeline_id,
        pipeline_name: pipName,
        pipeline_name_short: this._cutText(14, pipName),
        type: 'status',
      }
    })
  }

  private _cutText(length: number, text: string): string{
    if(text.length < length+1)
      return text;

    let sliced = text.slice(0,length);

    if (sliced.length < text.length) {
      sliced += '...';
    }
    return sliced
  }

  private _loadDepartments() {
    let extractStatuses = this._extractStatusesFromPipelines( )
    this._departments = FDepartmentsFabric.self.departments.map(item => {
      let statuses_id = item.statuses.map( i => i.id)
      return {
        id: item.id,
        name: item.title,
        type: 'department',
        statuses: extractStatuses.filter(i => statuses_id.includes(i.id)),
        department: item
      }
    })
  }

  private _extractStatusesFromPipelines(): IDropStatus[]{
    let departmentStatuses: Status[] = []
    FDepartmentsFabric.self.departments.forEach(item => {
      departmentStatuses = [...departmentStatuses, ...item.statuses]
    })

    if(!departmentStatuses.length)
      return [];

    let statusesDeletedFromPips: IDropStatus[] = []

    this.pipelines.forEach( pipeline => {
      let statusesNotBeInPipeline = departmentStatuses.filter(st => st.pipeline_id == pipeline.id).map(i => i.id)
      pipeline.statuses = pipeline.statuses.filter(status => {
        if(statusesNotBeInPipeline.includes(status.id)){
          statusesDeletedFromPips.push(status)
        } else {
          return status
        }
      })
    })
    return statusesDeletedFromPips
  }



  async addStatus( department_id: number, status: IDropStatus): Promise<void> {
    let department = this.departments.find(d => d.id === department_id)
    if(!department){
      throw new Error('drop_department do not exist')
    }
    await  department.department.createStatusesLinks([status.id])
  }

  async deleteStatus( department_id: number, status: IDropStatus): Promise<void>{
    let department = this.departments.find(d => d.id === department_id)
    if(!department){
      throw new Error('drop_department do not exist')
    }
    await department.department.deleteStatusesLinks([status.id])
  }

}
