import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';

// import Player from 'mpris-service';

// const player = Player({
// 	name: 'Jellyamp',
// 	identity: 'Jellyamp',
// 	supportedUriSchemes: ['file'],
// 	supportedMimeTypes: ['audio/aac'],
// 	supportedInterfaces: ['player']
// });

// setTimeout(function () {
// 	// @see http://www.freedesktop.org/wiki/Specifications/mpris-spec/metadata/
// 	player.metadata = {
// 		'mpris:trackid': player.objectPath('track/0'),
// 		'mpris:length': 60 * 1000 * 1000, // In microseconds
// 		'mpris:artUrl': 'https://s1.ibtimes.com/sites/www.ibtimes.com/files/2016/11/08/adele.jpg',
// 		'xesam:title': 'Lolol',
// 		'xesam:album': '21',
// 		'xesam:artist': ['Adele']
// 	};

// 	player.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;

// 	console.log('Now playing: Lolol - Adele - 21');
// }, 1000);

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: false,
    maximizable: false,
    frame: false,
    backgroundColor: '#000B25',
    titleBarStyle: 'hidden',
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });

  win.on('maximize', () => win.unmaximize());
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }

  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
