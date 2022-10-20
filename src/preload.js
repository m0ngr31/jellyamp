// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer, remote } from 'electron';

// eslint-disable-next-line no-underscore-dangle
window._app_version = process.env.npm_package_version;
window.ipcRenderer = ipcRenderer;
window.electronRemote = remote;
