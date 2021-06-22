import Vue from 'vue'

import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import defaultAxios from './App/core/axios'

import Vuelidate from 'vuelidate'

import VueFinalModal from 'vue-final-modal'
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import VShowSlide from 'v-show-slide'
import Clipboard from 'v-clipboard'

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
// import am4themes_dark from "@amcharts/amcharts4/themes/dark";

import {pragma_am4themes_dark} from "./components/ui/charts/amcharts/theme/dark"

// import SequentialEntrance from 'vue-sequential-entrance'
const SequentialEntrance = require('vue-sequential-entrance')
import 'vue-sequential-entrance/vue-sequential-entrance.css'
Vue.use(SequentialEntrance);

import ModalWizard from 'vue-modal-wizard'
Vue.use(ModalWizard)

am4core.useTheme(am4themes_animated)
am4core.useTheme(pragma_am4themes_dark)

defaultAxios()


export const bus = new Vue();
Vue.config.productionTip = false


Vue.use(VShowSlide, {
  customEasing: {
    exampleEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  }
})



Vue.use(Clipboard)
Vue.use(VueFinalModal())
Vue.use(Vuelidate)
Vue.use(Toast, {
  transition: "Vue-Toastification__fade",
  position: "top-center",
  maxToasts: 5,
  newestOnTop: true,
  icon: true,
  timeout: 3500,
  hideProgressBar: true,
  containerClassName: 'd-toast'
});




new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')


