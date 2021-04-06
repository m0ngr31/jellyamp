import { ipcRenderer, remote } from 'electron';

window._app_version = process.env.npm_package_version;
window.ipcRenderer = ipcRenderer;
window.electronRemote = remote;