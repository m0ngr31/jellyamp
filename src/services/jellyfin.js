import {v4 as uuidv4 } from 'uuid';

import {getItemOrDefault, setItem} from './localstorage';
import {Requests} from './requests';

const cleanUrl = url => {
  if (url.slice(0, 4) !== 'http') {
    throw new Error('Bad url');
  }

  if (url.slice(-1) !== '/') {
    return `${url}/`;
  }

  return url;
}

const JellyfinService = {
  getUser: () => {
    return getItemOrDefault('user', {Id: null});
  },
  setUser: userData => {
    setItem('user', userData);
  },
  getServer: () => {
    return getItemOrDefault('server', {uri: null});
  },
  setServer: serverData => {
    setItem('server', serverData);
  },
  getToken: () => {
    return getItemOrDefault('api-token', null);
  },
  setToken: token => {
    setItem('api-token', token);
  },
  checkServer: async serverUri => {
    try {
      const url = cleanUrl(serverUri);
      const serverData = await Requests.get(`${url}system/info/public`, null, false);

      JellyfinService.setServer(Object.assign({}, serverData, {uri: url}));
    } catch (e) {
      console.log(e);
      throw new Error('Server not found');
    }
  },
  login: async (username, password) => {
    try {
      const auth = await Requests.post('users/authenticatebyname', {Username: username, Pw: password}, true, false);

      JellyfinService.setUser(auth.User);
      JellyfinService.setToken(auth.AccessToken);
    } catch (e) {
      console.log(e);
      throw new Error('Could not login');
    }
  },
  getUsers: async () => {
    const users = await Requests.get('users/public', null, true, false);
    console.log(users);
  },
  getArtists: async () => {
    const userId = JellyfinService.getUser().Id;
    const artists = await Requests.get('Artists', {userId}, true, true);
    return artists.Items;
  },
  getArtistUrl: artist => {
    const keys = Object.keys(artist.ImageTags);

    if (!keys.length) {
      return null;
    }

    let imageKey;

    if (keys.includes('Primary')) {
      imageKey = 'Primary';
    } else {
      imageKey = keys[0];
    }

    const serverUri = JellyfinService.getServer().uri;
    return `${serverUri}Items/${artist.Id}/Images/${imageKey}`;
  },
  getItemPlayUrl: (itemId) => {
    const params = {
      UserId: JellyfinService.getUser().Id,
      DeviceId: getItemOrDefault('deviceId', null),
      MaxStreamingBitrate: '140000000',
      TranscodingContainer: 'ts',
      TranscodingProtocol: 'hls',
      AudioCodec: 'aac',
      api_key: JellyfinService.getToken(),
      PlaySessionId: uuidv4(),
      Container: ['opus','mp3','aac','m4a','m4b','flac','wav','ogg'],
    };

    const urlParams = new URLSearchParams(Object.entries(params))

    const serverUri = JellyfinService.getServer().uri;
    return `${serverUri}Audio/${itemId}/universal?${urlParams}`;
  }
};

export default JellyfinService;
