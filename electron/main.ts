import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// Configure logging for the updater
log.transports.file.level = "info";
autoUpdater.logger = log;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = app.isPackaged
  ? path.join(app.getAppPath(), 'dist')
  : path.join(__dirname, '../dist');

let win: BrowserWindow | null = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'LS Odontología - Chat',
    backgroundColor: '#F8FAFA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'), // Usamos .mjs o .js según tu build
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(distPath, 'index.html'));
  }

  win.on('closed', () => {
    win = null;
  });

  // Check for updates after the window is created
  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(err => {
      log.error("Error checking for updates:", err);
    });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Updater Events for better control
autoUpdater.on('update-available', () => {
  log.info('Update available.');
});

autoUpdater.on('update-downloaded', () => {
  log.info('Update downloaded; will install now');
  // Optional: ask user to restart
  // autoUpdater.quitAndInstall(); 
});

autoUpdater.on('error', (err) => {
  log.error('Error in auto-updater: ' + err);
});
