export namespace ICommonStatuses {
    // stage: combines several statuses

    export interface ICreateStage {
        readonly pipeline_id: number,
        readonly name: string,
        readonly  color: string,
        readonly  sort: number
    }

    export interface IItemStage extends ICreateStage{
        readonly id:number,
        readonly multiple: boolean
    }

    export interface IStatus extends IItemStage{
        statuses_id?: number[]
    }

    export interface ILinkStatuses {
        readonly segment_id: number,
        readonly stage_id: number,
        readonly statuses_id: number[]
    }

    export interface ILinkItemStatuses {
        readonly segment_id: number,
        readonly stage_id: number,
        readonly status_id: number
    }

    export interface IStatusesQuery{
        readonly data: ICreateStage | IItemStage | ILinkStatuses | ILinkItemStatuses | number[]
    }





    export interface ITestCreateStage {
        pipeline_id: number,
        name: string,
        color: string,
        sort: number
    }

    export interface ITestItemStage extends ITestCreateStage{
        id:number,
        multiple: boolean
    }

    export interface ITestLinkStatuses {
        stage_id: number,
        statuses_id: number[]
    }


}