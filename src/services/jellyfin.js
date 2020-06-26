import { getItemOrDefault, setItem } from './localstorage';
import { Requests } from './requests';

class JellyFinClient {
  constructor() {
    if (!JellyFinClient.instance) {
      JellyFinClient.instance = this;
    }

    return JellyFinClient.instance;
  }

  getUser() {
    return getItemOrDefault('user', null);
  }

  setUser(userData) {
    setItem('user', userData);
  }

  getServer() {
    return getItemOrDefault('serverUri', null);
  }

  setServer(serverUri) {
    setItem('serverUri', serverUri);
  }

  async login(username, password) {
    const auth = await Requests.post('users/authenticatebyname', { Username: username, Pw: password }, true, false);
    console.log(auth);
  }

  async getUsers() {
    const users = await Requests.get('users/public', null, true, false);
    console.log(users);
  }

  async getArtists() {
    const artists = await Requests.get('Artists', { userId: '' }, true, true);
    console.log(artists);
  }
}

const jellyfin = new JellyFinClient();
Object.freeze(jellyfin);

export default jellyfin;
