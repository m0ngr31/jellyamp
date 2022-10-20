import axios from 'axios';
import {v4 as uuidv4 } from 'uuid';

import {version} from '../../package.json';

import {Notifications} from './notifications';
import AuthService from './auth';
import {getItemOrDefault, setItem} from './localstorage';

const authAxios = axios.create();

authAxios.interceptors.request.use(config => {
  const token = getItemOrDefault('api-token', null);

  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers.common['X-MediaBrowser-Token'] = token;
  }

  return config;
}, error => Promise.reject(error));

authAxios.interceptors.response.use(res => res, err => {
  if (err.response && err.response.status === 401) {
    Notifications.service.open({
      duration: 5000,
      message: 'Session expired. Logging out.',
      position: 'is-top',
      type: 'is-warning',
    });

    AuthService.logout();
  }

  return Promise.reject(err);
});

const genConfig = (url, isJellyfin) => {
  const config = {};
  let newUrl = url;

  if (isJellyfin) {
    let deviceId = getItemOrDefault('deviceId', null);

    if (!deviceId) {
      deviceId = uuidv4();
      setItem('deviceId', deviceId);
    }

    config.headers = {};
    config.headers['X-Emby-Authorization'] = `MediaBrowser Client="Jellyamp", Device="PC", DeviceId="${deviceId}", Version="${version}"`;

    const serverUrl = getItemOrDefault('server', {uri: null}).uri;

    if (!serverUrl) {
      throw new Error('No server information');
    }

    newUrl = `${serverUrl}${url}`;
  }

  return [newUrl, config];
};

const Requests = {
  post: async (url, obj, jellyfinUrl = true, requiresAuth = true) => {
    const [uri, config] = genConfig(url, jellyfinUrl);

    const reqestHandler = requiresAuth ? authAxios : axios;

    const {data} = await reqestHandler.post(uri, obj, config);
    return data;
  },
  delete: async (url, _obj, jellyfinUrl = true, requiresAuth = true) => {
    const [uri, config] = genConfig(url, jellyfinUrl);

    const reqestHandler = requiresAuth ? authAxios : axios;

    const {data} = await reqestHandler.delete(uri, config);
    return data;
  },
  get: async (url, obj, jellyfinUrl, requiresAuth = true) => {
    const [uri, config] = genConfig(url, jellyfinUrl);

    const reqestHandler = requiresAuth ? authAxios : axios;

    if (obj) {
      config.params = obj;
    }

    const {data} = await reqestHandler.get(uri, config);
    return data;
  },
};

export default Requests;
