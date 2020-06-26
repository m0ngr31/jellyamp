import Vue from 'vue';
import VueRouter from 'vue-router';
import Meta from 'vue-meta';

import Login from '../views/Login.vue';
import Main from '../views/Main.vue';

import jellyfin from '../services/jellyfin';

Vue.use(VueRouter);
Vue.use(Meta);

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  {
    path: '/main',
    name: 'Main',
    component: Main,
    meta: { auth: true },
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach(async (to, from, next) => {
  const currentUser = jellyfin.getUser();
  const requiresAuth = to.matched.some((record) => record.meta.auth);

  if (requiresAuth && !currentUser) {
    await next({ name: 'Login' });
  } else if (!requiresAuth && currentUser) {
    await next({ name: 'Main' });
  } else if (!requiresAuth && !currentUser) {
    await next();
  }
});

export default router;
