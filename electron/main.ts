import { app, BrowserWindow, screen } from 'electron';
import path from 'node:path';
import { fileURLToPath, format } from 'node:url';
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
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    icon: path.join(publicPath, 'logo ls.jpeg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Temporarily disable for debugging local assets if needed
    },
    width: Math.min(1200, screenWidth),
    height: Math.min(800, screenHeight),
    title: 'LS Odontología - Chat',
  });

  // Remove menu bar for premium feel
  win.setMenuBarVisibility(false);

  // ALWAYS OPEN DEVTOOLS IN THIS DEBUG VERSION
  win.webContents.openDevTools();

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // In production, load the index.html from dist
    const indexPath = path.join(process.env.DIST, 'index.html');
    log.info('Loading internal path:', indexPath);
    
    win.loadFile(indexPath).catch(err => {
      log.error('Final fallback failed:', err);
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
