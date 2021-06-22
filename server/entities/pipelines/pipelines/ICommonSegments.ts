export namespace ICommonPipeline {
    export interface ICorrectSegment{
        readonly segment_id: number,
        isCorrect: boolean
    }

    export interface ICreateSegment {
        readonly account_id: number,
        readonly name?: string,
        readonly sort?: number | null | undefined
    }

    export interface IItemPipeline extends ICreateSegment{
        readonly sort?: number | null | undefined
        readonly id: number,
        readonly multiple: boolean
    }

    export interface IPipeline extends IItemPipeline{
        readonly pipelines_id: number[]
        isCorrect: boolean | null
    }

     export interface ILinkSegmentToPipeline {
        readonly segment_id: number,
        readonly pipelines_id: number[],
    }

    export interface ILinkItemSegment {
        readonly segment_id: number,
        readonly pipeline_id: number
    }

    export interface ICategorizedPipelines{
        readonly segments: IPipeline[],
        readonly pipelines: IPipeline[],
    }




    export interface ITestCreateSegment {
        account_id: number,
        name: string,
    }

    export interface ITestItemPipeline extends ITestCreateSegment{
        sort: number,
        readonly id: number,
        readonly multiple: boolean
    }

    export interface ITestLinkSegment {
        segment_id: number,
        pipelines_id: number[],
    }


} 