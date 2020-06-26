import Vue from 'vue';

import App from './App.vue';
import router from './router';

import jellyfin from './services/jellyfin';

Vue.config.productionTip = false;

console.log(jellyfin);

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
