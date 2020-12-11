import {v4 as uuidv4 } from 'uuid';

import router from '../router/index';
import {getItemOrDefault, setItem, removeItem} from './localstorage';
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
  logout: () => {
    removeItem('api-token');
    removeItem('server');
    removeItem('user');
    removeItem('bitrate');

    router.push({name: 'Login'});
  },
  getUsers: async () => {
    const users = await Requests.get('users/public', null, true, false);
    console.log(users);
  },
  search: async searchTerm => {
    const userId = JellyfinService.getUser().Id;

    const artists = await Requests.get('Artists', {searchTerm}, true, true);
    const songs = await Requests.get(`Users/${userId}/Items`, {searchTerm, IncludeItemTypes: 'Audio', Recursive: true}, true, true);
    const albums = await Requests.get(`Users/${userId}/Items`, {searchTerm, IncludeItemTypes: 'MusicAlbum', Recursive: true}, true, true);
    const playlists = await Requests.get(`Users/${userId}/Items`, {searchTerm, IncludeItemTypes: 'Playlist', Recursive: true}, true, true);

    return [artists.Items, songs.Items, albums.Items, playlists.Items];
  },
  getArtists: async () => {
    const userId = JellyfinService.getUser().Id;
    const artists = await Requests.get('Artists/AlbumArtists', {userId}, true, true);
    return artists.Items;
  },
  getItem: async itemId => {
    const userId = JellyfinService.getUser().Id;
    return Requests.get(`Users/${userId}/Items/${itemId}`, null, true, true);
  },
  getArtistAlbums: async artistId => {
    const params = {
      AlbumArtistIds: artistId,
      Recursive: true,
      IncludeItemTypes: ['MusicAlbum', 'Audio'],
      SortOrder: 'Descending',
      Limit: 500,
    };

    const userId = JellyfinService.getUser().Id;
    const res = await Requests.get(`Users/${userId}/Items`, params, true, true);

    const songs = res.Items.filter(item => item.Type === 'Audio');
    const albums = res.Items.filter(item => item.Type === 'MusicAlbum');

    return [songs, albums];
  },
  getAlbumSongs: async ParentId => {
    const params = {
      ParentId,
      SortBy: 'SortName',
    };

    const userId = JellyfinService.getUser().Id;
    const res = await Requests.get(`Users/${userId}/Items`, params, true, true);
    return res.Items;
  },
  getPlaylistSongs: async itemId => {
    const UserId = JellyfinService.getUser().Id;

    const params = {
      UserId,
    };

    const res = await Requests.get(`Playlists/${itemId}/Items`, params, true, true);
    return res.Items;
  },
  likeId: async itemId => {
    const userId = JellyfinService.getUser().Id;
    return await Requests.post(`Users/${userId}/FavoriteItems/${itemId}`);
  },
  unlikeId: async itemId => {
    const userId = JellyfinService.getUser().Id;
    return await Requests.delete(`Users/${userId}/FavoriteItems/${itemId}`);
  },
  getItemImageUrl: item => {
    const keys = Object.keys(item.ImageTags);

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
    return `${serverUri}Items/${item.Id}/Images/${imageKey}`;
  },
  getInstantMix: async itemId => {
    const UserId = JellyfinService.getUser().Id;

    const params = {
      UserId,
      Limit: 50,
    };

    const songs = await Requests.get(`Items/${itemId}/InstantMix`, params, true, true);
    return songs.Items;
  },
  updatePlaying: async params => {
    try {
      await Requests.post('Sessions/Playing', params, true, true);
    } catch (e) {
      // Do nothing
    }
  },
  updateProgress: async params => {
    try {
      await Requests.post('Sessions/Playing/Progress', params, true, true);
    } catch (e) {
      // Do nothing
    }
  },
  stopPlaying: async params => {
    try {
      await Requests.post('Sessions/Playing/Stopped', params, true, true);
    } catch (e) {
      // Do nothing
    }
  },
  getItemPlayUrl: itemId => {
    const params = {
      UserId: JellyfinService.getUser().Id,
      DeviceId: getItemOrDefault('deviceId', null),
      MaxStreamingBitrate: getItemOrDefault('bitrate', '12444445'),
      AudioCodec: 'aac',
      api_key: JellyfinService.getToken(),
      PlaySessionId: uuidv4(),
      Container: ['opus','mp3','aac','m4a','m4b','flac','wav','ogg'],
    };

    const urlParams = new URLSearchParams(Object.entries(params))

    const serverUri = JellyfinService.getServer().uri;
    return [`${serverUri}Audio/${itemId}/universal?${urlParams}`, params];
  },
};

export default JellyfinService;
