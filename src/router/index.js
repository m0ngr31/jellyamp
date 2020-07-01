import Vue from 'vue';
import VueRouter from 'vue-router';
import Meta from 'vue-meta';

import Login from '../views/Login.vue';
import Main from '../views/Main.vue';
import Search from '../views/Search.vue';
import Album from '../views/Album.vue';
import Artist from '../views/Artist.vue';
import Song from '../views/Song.vue';
import Genre from '../views/Genre.vue';

import JellyfinService from '../services/jellyfin';

Vue.use(VueRouter);
Vue.use(Meta);

const routes = [
  {
    path: '/auth',
    name: 'Login',
    component: Login,
    meta: { auth: false },
  },
  {
    path: '/',
    name: 'Main',
    component: Main,
    meta: { auth: true },
    children: [
      {
        path: '',
        name: 'Search',
        component: Search,
      },
      {
        path: 'album/:id',
        name: 'Album',
        component: Album,
      },
      {
        path: 'artist/:id',
        name: 'Artist',
        component: Artist,
      },
      {
        path: 'song/:id',
        name: 'Song',
        component: Song,
      },
      {
        path: 'genre/:id',
        name: 'Genre',
        component: Genre,
      },
    ]
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach(async (to, from, next) => {
  const currentUser = JellyfinService.getUser();
  const requiresAuth = to.matched.some((record) => record.meta.auth);

  if (requiresAuth && !currentUser.Id) {
    await next({ name: 'Login' });
  } else if (!requiresAuth && currentUser.Id) {
    await next({ name: 'Search' });
  } else if (to.name === 'Main') {
    await next({ name: 'Search' });
  } else {
    await next();
  }
});

export default router;
