import { IServer,  } from "./IServer";
import IRequest = IServer.IRequest;
import IQuery = IServer.IQuery;
import Errors = IServer.Errors;
import IAnalyticUrl = IServer.IAnalyticUrl;
import IEntitiesUrl = IServer.IEntitiesUrl;
import IUrl = IServer.IUrl;
import IDependenciesUrl = IServer.IDependenciesUrl;




export  class Router  {
    protected readonly request: IRequest

    constructor(request: IServer.IRequest) {
        this.request = Router.requestFormatting(request)
    }

    get url(): IUrl {
        return this.request.url
    }


    static requestFormatting(req: any): IServer.IRequest {
        return {
            url: Router.urlHandler(req.baseUrl, req.url),
            query: Router.urlQueryHandler(req.query)
        }
    }

    static urlHandler(baseUrl: string, url:string): IUrl{
        baseUrl = baseUrl.slice(1) + Router.cutUrl(url)
        let paths = baseUrl.split('/')

        if(paths[1] == 'entities'){
           return Router.urlEntitiesHandler(paths)
        }

        if(paths[1] == 'analytics'){
           return Router.urlAnalyticsHandler(paths)
        }

        if(paths[1] == 'dependencies'){
            return Router.urlDependencies(paths)
        }

        throw Errors.invalidQueryUrl("Second path argument in query url have to 'entities' or 'analytics' or 'dependencies' ")
    }

    static urlEntitiesHandler(paths: string[]): IEntitiesUrl{
        let methods = paths.slice(3)
        return{
            type:'entities',
            entity: paths[2],
            method: methods.join('/')
        }
    }

    static urlDependencies(paths: string[]): IDependenciesUrl{
        let methods = paths.slice(3)
        return{
            type:'dependencies',
            entity: paths[2],
            method: methods.join('/')
        }
    }

    static urlAnalyticsHandler(paths: string[]): IAnalyticUrl{
        let methods = paths.slice(4)
        return{
            type:'analytics',
            method: paths[2]
        }
    }

    static cutUrl(url:string): string{
        let separateLst = url.split('?')
        return separateLst[0]
    }

    static urlQueryHandler(query: any):  IQuery {
        if('filter' in query){
            return { filter: JSON.parse(query.filter) }
        }
        if('data' in query){
            if( Array.isArray(query.data) ){
                let data = query.data.map((item: string) => JSON.parse(item))
                return {data}
            }
            return { data: JSON.parse(query.data) }
        }

        return {  data: query }
    }
}
