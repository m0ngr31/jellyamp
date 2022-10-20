import Vue from 'vue';
import Buefy from 'buefy';
import VueTitlebar from '@wuild/vue-titlebar';

import App from './App.vue';
import router from './router';

// Disable Zooming: https://github.com/electron/electron/issues/8793#issuecomment-648307765
window.onkeydown = evt => {
  if (
    (evt.code === 'Minus' || evt.code === 'Equal') && (evt.ctrlKey || evt.metaKey)
  ) {
    evt.preventDefault();
  }
};

Vue.config.productionTip = false;

Vue.use(Buefy);
Vue.use(VueTitlebar);

new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
