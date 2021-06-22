import Vue from 'vue'
import VueRouter from 'vue-router'
// import Selling from '../views/SellingAnalysis.vue'
import store from '../store'
import axios from 'axios'
import Gateway, {AnaliticGateway} from "../App/authorization/Gateway";
import App from "../App/App";
import {authorizationHeader} from "../App/core/axios";
 
Vue.use(VueRouter)


async function analiticGuard(to, from, next, fetch){
  // localStorage.clear()
  store.commit('set_loading', true)
  const flag = await AnaliticGateway.self.routeGuard()
  await init(flag, fetch)
  flag && next()  
}

async function profileGuard(to, from, next, fetch){
  // localStorage.clear()
  store.commit('set_loading', true)
  const flag = await Gateway.self.routeGuard()
  await init(flag, fetch)
  flag && next()
}

async function init(flag, fetch) {
  if(!flag) return;
  await App.self.initOnce()

  if(fetch) await store.dispatch(fetch)  
}

const routes = [   
  {
    path: '/login',
    name: 'Authentication',
    meta: {layout: 'empty'},    
    component: () => import( '../views/Authentication.vue'),
    beforeEnter:  async(to, from, next) => { 
      let allow =  Gateway.self.checkToken

      if(allow) next('/')
      else next()
    },
  },

  {
    path: '/',
    name: 'MainPage',
    beforeEnter:  async(to, from, next) => {

      if(to.query.user_id && to.query.account){
        await App.self.comeFromExternal({
          user_id: to.query.user_id,
          account_id: to.query.account
        })
      }

      next('/salesAnalysis')
    },
  },

  {
    path: '/expenses',
    name: 'Expenses',
    meta: {
      layout: 'empty',
      title: 'Расходы и издержки',
      stub: false,
    },
    component: () => import( '../views/Expenses.vue'),
    beforeEnter:  async(to, from, next) => {
      await profileGuard(to, from, next)
    },
  },


  {
    path: '/profile',
    name: 'UserProfile',
    meta: {
      layout: 'empty',
      title: 'Профиль пользователя',
      stub: false,
    },
    component: () => import( '../views/UserProfile.vue'),
    beforeEnter:  async(to, from, next) => {
      await profileGuard(to, from, next, 'load_profile')
    },
  },


  {
    path: '/salesAnalysis',
    name: 'Sales',
    meta: {
      layout: 'main',
      title: 'Анализ продаж',
      stub: false,
    },
    component: () => import( '../views/SellingAnalysis.vue'),
    beforeEnter:  async(to, from, next) => {
      await analiticGuard(to, from, next, 'fetch_sellingAnalysis') 
    },
  },

  {
    path: '/consolidated',
    name: 'Consolidated',
    meta: {
      layout: 'main',
      title: 'Сводный отчет',
      stub: false,
    },
    component: () => import( '../views/ConsolidatedReport.vue'),
    beforeEnter:  async(to, from, next) => {
      await analiticGuard(to, from, next, 'fetch_consolidateReport')
    },
  },

  {
    path: '/employee',
    name: 'Employee',
    meta: {
      layout: 'main',
      title: 'Отчет по сотрудникам',
      stub: false,
    },
    component: () => import( '../views/EmployeeReport.vue'),
    beforeEnter:  async(to, from, next) => {
      await analiticGuard(to, from, next, 'fetch_employeeReport')
    },
  },

  {
    path: '/gallery',
    name: 'GalleryMetric',
    meta: {
      layout: 'main',
      title: 'Показатели',
      stub: false,
    },
    component: () => import( '../views/GalleryMetrics.vue'),
    beforeEnter:  async(to, from, next) => {
      await analiticGuard(to, from, next)
    },
  },
  
  {
    path: '/settings',
    name: 'Settings',
    meta: {
      layout: 'main',
      title: 'Настройки',
      stub: false,
    },
    component: () => import( '../views/Settings.vue'),
    beforeEnter:  async(to, from, next) => {
      await analiticGuard(to, from, next, 'fetch_settingsDefault')
    },
  },


  {
    path: '/api/user/verify:pathMatch(.*)*',
    name: 'UserProfile',
    meta: {layout: 'empty'},
    component: () => import( '../views/UserProfile.vue'),
    beforeEnter:  async(to, from, next) => { 
      let res = await axios.get('/api/user/go_from_link', { params:{
        token: to.query.token
      }})

      if(res.data.success){
        authorizationHeader(res.data.token)
      } else {
        // store.commit('set_toast', { type:'error', message:res.data.message })
        next('/login')
      }
      await profileGuard(to, from, next)      
    },
  }, 
    
  {
    path: '/500',
    name: 'error500',
    meta: {layout: 'empty'},
    component: () => import( '../views/errors/Error500.vue'),
  },
  
  {
    path: '/:pathMatch(.*)*',
    name: 'error404',
    meta: {layout: 'empty'},
    component: () => import( '../views/errors/Error404.vue'),
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})





export default router
