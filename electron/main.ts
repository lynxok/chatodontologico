import { app, BrowserWindow, crashReporter, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

// Start crash reporter
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

let win: BrowserWindow | null = null;

function createWindow() {
  log.info('Creating window...');
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

  // Load content
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(distPath, 'index.html'));
  }

  win.once('ready-to-show', () => {
    win?.show();
    log.info('Window shown.');
    // Check for updates after window is visible
    if (app.isPackaged) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch(err => log.error('Update check failed:', err));
      }, 3000);
    }
  });

  // Auto-update events
  autoUpdater.on('update-available', () => {
    win?.webContents.send('update_available');
  });

  autoUpdater.on('update-downloaded', () => {
    win?.webContents.send('update_downloaded');
  });

  win.on('closed', () => {
    win = null;
  });
}

// Handle update install command from renderer
ipcMain.on('restart_app', () => {
  autoUpdater.quitAndInstall();
});

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

app.whenReady().then(() => {
  createWindow();
});
