import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

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
      preload: path.join(__dirname, 'preload.mjs'),
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

  win.on('closed', () => { win = null; });

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(err => log.error(err));
  }
}

// ── IPC Handler for Admin Debug Console ──────────────────────────────
ipcMain.on('open-dev-tools', () => {
  if (win) win.webContents.openDevTools();
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

autoUpdater.on('update-available', () => log.info('Update available.'));
autoUpdater.on('update-downloaded', () => log.info('Update downloaded.'));
autoUpdater.on('error', (err) => log.error('Updater error: ' + err));
