import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

// Configure logging
autoUpdater.logger = log;
(autoUpdater.logger as any).transports.file.level = 'info';

// The built directory structure
// dist - web app
// dist-electron - electron main scripts

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Relative paths for development / production
const distPath = path.join(__dirname, '../dist');
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
    },
    width: 1200,
    height: 800,
    title: 'LS Odontología - Chat',
  });

  // Remove menu bar for premium feel
  win.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production, load the index.html from dist
    const indexPath = path.join(process.env.DIST, 'index.html');
    win.loadFile(indexPath).catch(err => {
      console.error('Failed to load index.html:', err);
      // Fallback for some bundle structures
      win?.loadURL(`file://${path.resolve(process.env.DIST, 'index.html')}`);
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
  
  if (app.isPackaged) {
    startUpdateCheck();
  }
});
