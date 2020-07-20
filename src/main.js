import Vue from 'vue';
import Buefy from 'buefy';
import VueTitlebar from '@wuild/vue-titlebar';

import App from './App.vue';
import router from './router';

import JellyfinService from './services/jellyfin';

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VueTitlebar);

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
