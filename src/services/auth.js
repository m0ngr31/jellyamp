import { Howler } from 'howler';

import {setItem, removeItem} from './localstorage';

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
    Howler.stop();

    removeItem('api-token');
    removeItem('server');
    removeItem('user');
    removeItem('bitrate');

    window.location.replace('/');
  },
};

export default AuthService;
