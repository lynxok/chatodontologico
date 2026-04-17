import { app, BrowserWindow, crashReporter, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

// Start crash reporter before anything else
crashReporter.start({
  uploadToServer: false,
  compress: false,
});

// Configure logging
autoUpdater.logger = log;
log.transports.file.level = 'debug';
log.info('App starting...');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const distPath = app.isPackaged
  ? path.join(app.getAppPath(), 'dist')
  : path.join(__dirname, '../dist');

process.env.DIST = distPath;
process.env.VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    width: 1200,
    height: 800,
    title: 'LS Odontología - Chat',
    backgroundColor: '#F8FAFA',
    show: false,
  });

  win.setMenuBarVisibility(false);

  win.once('ready-to-show', () => {
    win?.show();
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // Auto-update events
  autoUpdater.on('update-available', () => {
    win?.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    win?.webContents.send('update_downloaded');
  });
}

// Handle update install command from renderer
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  createWindow();
});
