var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from 'axios';
import Gateway from "../authorization/Gateway";
import App from "../App";
import { Response } from "./Response";
export default function defaultAxios() {
    axios.interceptors.request.use(function (req) {
        // if(isLoggedOut()){
        //   let replace = replaceTokens()
        //   authorizationHeader(replace.token)
        // } 
        return req;
    }, (err) => {
        return Promise.reject(err);
    });
    axios.interceptors.response.use((response) => { return response; }, function (error) {
        return __awaiter(this, void 0, void 0, function* () {
            if (error.response.status === 401) {
                let update = yield Gateway.self.routeGuard();
                if (!update) {
                    yield App.self.logout();
                    return false;
                }
                let tokens = JSON.parse(localStorage.getItem('access') || '{}');
                if (!tokens.token) {
                    yield App.self.logout();
                }
                error.config.headers['Authorization'] = `Bearer ${tokens.refresh} `;
                authorizationHeader(`Bearer ${tokens.token}`);
                error.config.baseURL = undefined;
                return axios.request(error.config);
            }
            if (error.response.status === 500) {
                // router.push('/500')
            }
            return Promise.reject(error);
        });
    });
}
function get(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield axios({
            method: 'GET',
            url: url,
            params: params
        });
        return Response.handler(res);
    });
}
function getLong(url, params, timeoutSec = 30000) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield axios({
            method: 'GET',
            url: url,
            params: params,
            timeout: timeoutSec,
        });
        return Response.handler(res);
    });
}
function post(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield axios({
            method: 'POST',
            url: url,
            params: params
        });
        return Response.handler(res);
    });
}
function update(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield axios({
            method: 'PUT',
            url: url,
            params: params
        });
        return Response.handler(res);
    });
}
function remove(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield axios({
            method: 'DELETE',
            url: url,
            params: params
        });
        return Response.handler(res);
    });
}
function send(url, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let res = yield axios({
            method: 'POST',
            url: url,
            params: params
        });
    });
}
function authorizationHeader(token) {
    axios.defaults.headers = {
        Authorization: `Bearer ${token}`
    };
}
export { authorizationHeader, get, post, update, remove, getLong, send };
//# sourceMappingURL=axios.js.map