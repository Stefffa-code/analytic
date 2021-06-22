import store from '../../store/index'


export class Response{

  static handler(res){
    if(!res) return true;
    if('error' in res.data?.result){
      store.commit('set_toast', {type: 'error', message: res.data.result.message})
      return false
    }
    return res.data.result
  }

}
