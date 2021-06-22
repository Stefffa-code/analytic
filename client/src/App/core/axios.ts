import axios from 'axios'
import Gateway from "../authorization/Gateway";
import App from "../App";
import {Response} from "./Response";



export default  function defaultAxios(){
  axios.interceptors.request.use(
    function (req) {
      // if(isLoggedOut()){
      //   let replace = replaceTokens()
      //   authorizationHeader(replace.token)
      // } 

      return req;
    },
    (err) => {
      return Promise.reject(err);
    }
  );

  axios.interceptors.response.use(
    (response) => { return response }, 
  
    async function (error) {
      console.log(error)
      if (error.response.status === 401) {
          let update = await Gateway.self.routeGuard()
          if(!update){
            await App.self.logout()
            return false
          }

          let tokens = JSON.parse(localStorage.getItem('access') || '{}')
          if(!tokens.token){
            await App.self.logout()
          }
          error.config.headers['Authorization'] = `Bearer ${tokens.refresh} `  ;

          authorizationHeader(`Bearer ${tokens.token}`)
          error.config.baseURL = undefined;
          return axios.request(error.config);
      }
      if (error.response.status === 500) {
        // router.push('/500')
      }
      return Promise.reject(error);
    }
  );
} 

async function get(url: string, params?: object | null): Promise<any>{
  let res =  await axios({
    method: 'GET',
    url:  url,
    params: params
  })
  return Response.handler(res)
}

async function getLong(url: string, params?: object | null, timeoutSec:number = 30000 ): Promise<any>{
  let res =  await axios({
    method: 'GET',
    url:  url,
    params: params,
    timeout: timeoutSec,
  })
  return Response.handler(res)
}

async function post(url: string, params: object | null): Promise<any>{
  let res =await axios({
    method: 'POST',
    url:  url,
    params: params
  })
  return Response.handler(res)
}

async function update(url: string, params: object | null): Promise<any>{
  let res = await axios({
    method: 'PUT',
    url:  url,
    params: params
  })
  return Response.handler(res)
}

async function remove(url:string, params: object | null): Promise<any>{
  let res =  await axios({
    method: 'DELETE',
    url:  url,
    params: params
  })
  return Response.handler(res)
}

async function send(url: string, params: object | null): Promise<void>{
  let res =await axios({
    method: 'POST',
    url:  url,
    params: params
  })
}

function authorizationHeader(token: string): void{
  axios.defaults.headers = {
    Authorization: `Bearer ${token}`
  }
}


export {
  authorizationHeader,
  get,
  post,
  update,
  remove,
  getLong,
  send
}
