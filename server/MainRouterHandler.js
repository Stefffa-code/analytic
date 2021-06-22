import { IServer, } from "./IServer";
var Errors = IServer.Errors;
export class Router {
    constructor(request) {
        this.request = Router.requestFormatting(request);
    }
    get url() {
        return this.request.url;
    }
    static requestFormatting(req) {
        return {
            url: Router.urlHandler(req.baseUrl, req.url),
            query: Router.urlQueryHandler(req.query)
        };
    }
    static urlHandler(baseUrl, url) {
        baseUrl = baseUrl.slice(1) + Router.cutUrl(url);
        let paths = baseUrl.split('/');
        if (paths[1] == 'entities') {
            return Router.urlEntitiesHandler(paths);
        }
        if (paths[1] == 'analytics') {
            return Router.urlAnalyticsHandler(paths);
        }
        if (paths[1] == 'dependencies') {
            return Router.urlDependencies(paths);
        }
        throw Errors.invalidQueryUrl("Second path argument in query url have to 'entities' or 'analytics' or 'dependencies' ");
    }
    static urlEntitiesHandler(paths) {
        let methods = paths.slice(3);
        return {
            type: 'entities',
            entity: paths[2],
            method: methods.join('/')
        };
    }
    static urlDependencies(paths) {
        let methods = paths.slice(3);
        return {
            type: 'dependencies',
            entity: paths[2],
            method: methods.join('/')
        };
    }
    static urlAnalyticsHandler(paths) {
        let methods = paths.slice(4);
        return {
            type: 'analytics',
            method: paths[2]
        };
    }
    static cutUrl(url) {
        let separateLst = url.split('?');
        return separateLst[0];
    }
    static urlQueryHandler(query) {
        if ('filter' in query) {
            return { filter: JSON.parse(query.filter) };
        }
        if ('data' in query) {
            if (Array.isArray(query.data)) {
                let data = query.data.map((item) => JSON.parse(item));
                return { data };
            }
            return { data: JSON.parse(query.data) };
        }
        return { data: query };
    }
}
//# sourceMappingURL=MainRouterHandler.js.map