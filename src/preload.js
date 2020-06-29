import { ipcRenderer, remote } from 'electron';
window.ipcRenderer = ipcRenderer;
window.electronRemote = remote;
