import Vue from 'vue'
import App from './App.vue'
import store from './store'
import axios from 'axios';
import VueAxios from 'vue-axios';

axios.defaults.withCredentials = true

Vue.use(VueAxios, axios);


// 全局 引入
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);



Vue.config.productionTip = false

import router from './router'

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
