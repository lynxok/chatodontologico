import { app, BrowserWindow, ipcMain, Notification, screen, nativeImage } from 'electron';
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
  const preloadPath = path.join(__dirname, 'preload.js');
  log.info("Cargando preload desde:", preloadPath);

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'LS Odontología - Chat',
    backgroundColor: '#F8FAFA',
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Desactivar sandbox para facilitar la carga de ESM si es necesario
    },
  });

  win.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(distPath, 'index.html'));
  }

  win.on('closed', () => { win = null; });
  win.on('focus', () => { win?.flashFrame(false); });

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify().catch(err => log.error(err));
  }
}

// ── IPC Handler for Admin Debug Console ──────────────────────────────
ipcMain.on('open-dev-tools', () => {
  if (win) win.webContents.openDevTools();
});

ipcMain.on('notify-message', () => {
  if (win && !win.isFocused()) {
    win.flashFrame(true);
  }
});

ipcMain.on('focus-window', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
    win.show();
  }
});

// Set AppUserModelId as early as possible
if (process.platform === 'win32') {
  app.setAppUserModelId('LSChat');
}

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.on('show-notification', (event, { title, body }) => {
  // 1. Notificación nativa como respaldo silencioso
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: true }).show();
  }

  // 2. Ventana flotante personalizada (Asegura visibilidad fuera de la app)
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const notifyWin = new BrowserWindow({
    width: 380,
    height: 120,
    x: width - 390,
    y: height - 130,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false, // Evita que robe el foco al aparecer
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const notificationPath = app.isPackaged
    ? path.join(distPath, 'notification.html')
    : path.join(__dirname, '../public/notification.html');

  notifyWin.loadURL(`file://${notificationPath}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`);

  // Detectar clic mediante el hash
  notifyWin.webContents.on('did-navigate-in-page', (e, url) => {
    if (url.includes('#clicked')) {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      }
      notifyWin.close();
    }
  });

  // Auto-cerrar
  setTimeout(() => {
    if (!notifyWin.isDestroyed()) notifyWin.close();
  }, 6000);
});

ipcMain.on('set-badge-count', (event, count) => {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    app.setBadgeCount(count);
  }
  
  // Para Windows, si queremos un contador visual, el renderizador debe enviarnos una imagen
  // Esto se manejará mediante un mensaje separado o extendiendo este.
});

ipcMain.on('set-overlay-icon', (event, dataUrl) => {
  if (win && process.platform === 'win32') {
    if (dataUrl) {
      const img = nativeImage.createFromDataURL(dataUrl);
      win.setOverlayIcon(img, 'Mensajes pendientes');
    } else {
      win.setOverlayIcon(null, '');
    }
  }
});

ipcMain.on('check-for-updates', () => {
  autoUpdater.checkForUpdates().catch(err => {
    if (win) win.webContents.send('update-error', err.message);
  });
});

autoUpdater.on('update-available', (info) => {
  if (win) win.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  if (win) win.webContents.send('update-not-available', info);
});

autoUpdater.on('download-progress', (progress) => {
  if (win) win.webContents.send('update-download-progress', progress);
});

autoUpdater.on('update-downloaded', (info) => {
  if (win) win.webContents.send('update-downloaded', info);
});

autoUpdater.on('error', (err) => {
  if (win) win.webContents.send('update-error', err.message);
});

app.whenReady().then(() => {
  createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
