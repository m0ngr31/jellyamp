import router from '../router/index';

import {setItem, removeItem} from './localstorage';
import PlayerService from './player';

const AuthService = {
  setUser: userData => {
    setItem('user', userData);
  },
  setToken: token => {
    setItem('api-token', token);
  },
  login: (user, token) => {
    AuthService.setUser(user);
    AuthService.setToken(token);
  },
  logout: () => {
    PlayerService.stop();

    removeItem('api-token');
    removeItem('server');
    removeItem('user');
    removeItem('bitrate');

    router.push({name: 'Login'});
  }
}

export default AuthService;
