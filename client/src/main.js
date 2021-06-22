"use strict";
exports.__esModule = true;
exports.bus = void 0;
var vue_1 = require("vue");
var App_vue_1 = require("./App.vue");
require("./registerServiceWorker");
var router_1 = require("./router");
var store_1 = require("./store");
var axios_1 = require("./utils/axios");
var vuelidate_1 = require("vuelidate");
// const Vuelidate = require('vuelidate')
var vue_final_modal_1 = require("vue-final-modal");
var vue_toastification_1 = require("vue-toastification");
require("vue-toastification/dist/index.css");
var v_show_slide_1 = require("v-show-slide");
var v_clipboard_1 = require("v-clipboard");
var am4core = require("@amcharts/amcharts4/core");
var animated_1 = require("@amcharts/amcharts4/themes/animated");
// import am4themes_dark from "@amcharts/amcharts4/themes/dark";
var dark_1 = require("./components/ui/charts/amcharts/theme/dark");
// import SequentialEntrance from 'vue-sequential-entrance'
var SequentialEntrance = require('vue-sequential-entrance');
require("vue-sequential-entrance/vue-sequential-entrance.css");
// const VueInputMask = require('vue-inputmask').default
// Vue.use(VueInputMask)
vue_1["default"].use(SequentialEntrance);
am4core.useTheme(animated_1["default"]);
am4core.useTheme(dark_1.pragma_am4themes_dark);
axios_1["default"]();
exports.bus = new vue_1["default"]();
vue_1["default"].config.productionTip = false;
vue_1["default"].use(v_show_slide_1["default"], {
    customEasing: {
        exampleEasing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
});
vue_1["default"].use(v_clipboard_1["default"]);
vue_1["default"].use(vue_final_modal_1["default"]());
vue_1["default"].use(vuelidate_1["default"]);
vue_1["default"].use(vue_toastification_1["default"], {
    transition: "Vue-Toastification__fade",
    position: "top-center",
    maxToasts: 5,
    newestOnTop: true,
    icon: true,
    timeout: 3500,
    hideProgressBar: true,
    containerClassName: 'd-toast'
});
new vue_1["default"]({
    router: router_1["default"],
    store: store_1["default"],
    render: function (h) { return h(App_vue_1["default"]); }
}).$mount('#app');
