import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import jellyfin from './jellyfin';
import { getItemOrDefault, setItem } from './localstorage';

const genConfig = (url, isJellyfin, needsAuth, isPost = false) => {
  const config = {};

  if (isJellyfin) {
    let deviceId = getItemOrDefault('deviceId', null);

    if (!deviceId) {
      deviceId = uuidv4();
      setItem('deviceId', deviceId);
    }

    config.headers = {};
    config.headers['X-Emby-Authorization'] = `MediaBrowser Client="JellyAmp", Device="PC", DeviceId="${deviceId}", Version="10.5.0"`;

    const serverUrl = jellyfin.getServer();

    if (!serverUrl) {
      throw new Error('No server information');
    }

    url = `${serverUrl}${url}`;

    if (needsAuth) {
      config.headers['X-MediaBrowser-Token'] = '';
    }
  }

  return [url, config];
};

export const Requests = {
  post: async (url, obj, jellyfinUrl = true, requiresAuth = true) => {
    const [uri, config] = genConfig(url, jellyfinUrl, requiresAuth);

    const { data } = await axios.post(uri, obj, config);
    return data;
  },
  get: async (url, obj, jellyfinUrl, requiresAuth = true) => {
    const [uri, config] = genConfig(url, jellyfinUrl, requiresAuth);

    if (obj) {
      config.params = obj;
    }

    const { data } = await axios.get(uri, config);
    return data;
  },
};
