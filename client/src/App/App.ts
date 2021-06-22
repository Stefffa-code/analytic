import User from './user/User'
import Gateway  from './authorization/Gateway'
import Account from './account/Account'
import {ICommonUser} from "../../../server/entities/user/ICommonUser";
import IHiddenLogin = ICommonUser.IHiddenLogin;
import store from '../store'
import router from '../router'
import {getItem, removeItem} from "./core/storage";
import {AnalyticsWatcher} from "./analytics/watcher/Watcher";



export default class App {
  static _self
  private  _initApp

  static get self() {
    if(App._self)
      return App._self
    App._self = new App()
    return App._self
  }


  constructor(){
    this._initApp = false
  }

  get initApp(){
    return this._initApp
  }

  set initApp(value){
    this._initApp = !!value
  }

  async login(param){
    return  await Gateway.self.oAuth(param)
      && await this.init()
  }

  async logout() {
    await Gateway.self.logout()
    Account.self.reset()
    User.self.reset()
    store.commit('set_messageWhenLogin')
  }


  async init(){
    this.initApp = await User.self.init()
      && await Account.self.defineAccount(User.self.accounts)
    return this.initApp
  }

  async initOnce() {
    if(this.initApp)
      return true;

    await Account.self.setAccountFromStorage()
    return await this.init()
  }


  async beforePage() {
    return await this.analiticRouteGuard() && this.initOnce()
  }

  async analiticRouteGuard(){
    return await Gateway.self.routeGuard() && await Gateway.self.checkAccount()
  }

  async comeFromExternal(externalUser: IExternalUser){
    const isAuth = await Gateway.self.routeGuard()
    if(!isAuth){
      let res = await User.getPartialHiddenLogin(externalUser.user_id)
      if(!res.find) return;
      this._setLoginMessageForUser(res)
      return
    }

    await this._compareUsers(externalUser.user_id)
    await this._switchAccount(externalUser.account_id)
  }

  private async _compareUsers(external_user_id: number){
    let authUser = getItem('user')
    if(authUser.id != external_user_id){
      await this.logout()
      router.push('/login')
      return;
    }
    await User.self.init()
  }

  private _setLoginMessageForUser(param: IHiddenLogin){
    let message = `Ваш логин ${param.email} `
    if(param.phone)
      message += ` или ${param.phone}`;

    store.commit('set_messageWhenLogin', message)
  }

  private async  _switchAccount(newAccountId: number){
    let account = User.self.accounts.find(acc => acc.id == newAccountId)

    if(!account){
      removeItem('account')
      router.push('/profile')
      return
    }

    await Account.self.changeCurrentAccount(account)
    return;

  }

}

interface IExternalUser {
  account_id: number,
  user_id: number
}
