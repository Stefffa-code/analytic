import {AnalyticTypes} from "./AnalyticTypes";
import ISliceQuery = AnalyticTypes.ISliceQuery;
const zlib = require('zlib');
const log = require('log4js').getLogger('metrics ');
const { Op, fn, col, literal, query, QueryTypes } = require('sequelize');



export  class AnalyticExecutor {
    private static inst: AnalyticExecutor
    static get self(): AnalyticExecutor {
        if(AnalyticExecutor.inst) return AnalyticExecutor.inst
        AnalyticExecutor.inst = new AnalyticExecutor()
        return AnalyticExecutor.inst
    }

    private async toGzipData(data:any){
        let stringData = JSON.stringify(data)
        await zlib.gzip(stringData, (err: any, buffer: any) => {
            if (err) {
                log.error(err.stack)
            }
        });
        return stringData
    }


    async loadAll(account_id: number){

    }

    async loadSliceFrom(data: ISliceQuery){

    }

}