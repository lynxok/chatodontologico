import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// Configure logging
autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = 'info';

// Disable hardware acceleration to prevent black screens on Windows
app.disableHardwareAcceleration();

// The built directory structure
// dist - web app
// dist-electron - electron main scripts

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In production, we use the app package path
const distPath = app.isPackaged 
  ? path.join(app.getAppPath(), 'dist')
  : path.join(__dirname, '../dist');

const publicPath = app.isPackaged ? distPath : path.join(__dirname, '../public');

process.env.DIST = distPath;
process.env.VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(publicPath, 'logo ls.jpeg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    width: 1200,
    height: 800,
    title: 'LS Odontología - Chat',
    backgroundColor: '#F8FAFA', // Match our design background
  });

  win.setMenuBarVisibility(false);

  // Still open devtools for this final diagnostic test
  win.webContents.openDevTools();

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // Ultra-reliable loading path
    const indexPath = path.join(process.env.DIST, 'index.html');
    win.loadFile(indexPath).catch(err => {
      log.error('Fatal load error:', err);
    });
  }
}

function startUpdateCheck() {
  // Check immediately on startup
  autoUpdater.checkForUpdatesAndNotify();

  // Check every 8 hours
  const INTERVAL = 8 * 60 * 60 * 1000;
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, INTERVAL);
}

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
  
  /* 
  Temporarily disable auto-updater during diagnostic phase
  if (app.isPackaged) {
    startUpdateCheck();
  }
  */
});
