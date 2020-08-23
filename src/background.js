import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import path from 'path';

let player;
let Player;
let playerHandler;
let currentPlaytime = 0;

const isDevelopment = process.env.NODE_ENV !== 'production';
const isLinux = process.platform === 'linux';

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
    height: 700,
    resizable: false,
    maximizable: false,
    frame: false,
    backgroundColor: '#000B25',
    icon: path.join(__static, 'icon.png'),
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

// Disable Chrome's lame MPRIS implementation
if (isLinux) {
  app.commandLine.appendSwitch('disable-features', 'MediaSessionService');
}

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
  } else {}

  createWindow();
});

const setupPlayer = ev => {
  if (isLinux) {
    Player = require('mpris-service');

    player = Player({
      name: 'Jellyamp',
      identity: 'Jellyamp',
      supportedUriSchemes: ['file'],
      supportedMimeTypes: ['audio/aac'],
      supportedInterfaces: ['player'],
      canSeek: false,
    });

    playerHandler = ev;

    player.on('next', () => { currentPlaytime = 0; playerHandler.reply('skip'); });
    player.on('previous', () => { currentPlaytime = 0; playerHandler.reply('prev'); });
    player.on('pause', () => { currentPlaytime = 0; playerHandler.reply('playPause'); });
    player.on('playpause', () => { currentPlaytime = 0; playerHandler.reply('playPause'); });
    player.on('play', () => { currentPlaytime = 0; playerHandler.reply('playPause'); });
    player.on('stop', () => { currentPlaytime = 0; playerHandler.reply('stop'); });
    player.on('quit', () => app.quit());
    player.on('raise', () => win.restore());

    player.getPosition = () => {
      return currentPlaytime;
    }
  }
};

if (isLinux) {
  ipcMain.on('play', (ev, data) => {
    if (!player) {
      setupPlayer(ev);
    }

    player.metadata = {
      'mpris:trackid': player.objectPath('track/0'),
      'mpris:length': data.duration,
      'mpris:artUrl': data.img,
      'xesam:title': data.name,
      'xesam:album': data.album,
      'xesam:artist': data.artist,
    };

    player.playbackStatus = Player.PLAYBACK_STATUS_PLAYING;
  });

  ipcMain.on('pause', ev => {
    if (!player) {
      setupPlayer(ev);
    }

    player.playbackStatus = Player.PLAYBACK_STATUS_PAUSED;
  });

  ipcMain.on('stop', ev => {
    if (!player) {
      setupPlayer(ev);
    }

    player.playbackStatus = Player.PLAYBACK_STATUS_STOPPED;
  });

  ipcMain.on('updateTime', (_ev, data) => {
    currentPlaytime = data;
  });
}

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
