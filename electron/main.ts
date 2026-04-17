import { app, BrowserWindow, crashReporter } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import log from 'electron-log';

// Start crash reporter before anything else
crashReporter.start({
  uploadToServer: false,
  compress: false,
});

// Configure logging
log.transports.file.level = 'debug';
log.info('App starting...');

// app.disableHardwareAcceleration();
// app.commandLine.appendSwitch('disable-gpu');
// app.commandLine.appendSwitch('disable-gpu-compositing');
// app.commandLine.appendSwitch('disable-software-rasterizer');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// In production, the app is inside an ASAR archive. app.getAppPath() points to it.
const distPath = app.isPackaged
  ? path.join(app.getAppPath(), 'dist')
  : path.join(__dirname, '../dist');

process.env.DIST = distPath;
process.env.VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

log.info('distPath resolved to:', distPath);

let win: BrowserWindow | null;

function createWindow() {
  log.info('Creating BrowserWindow...');

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
    show: false, // Don't show until ready-to-show to prevent black flash
  });

  win.setMenuBarVisibility(false);

  // Show window only when content is ready
  win.once('ready-to-show', () => {
    log.info('Window ready-to-show');
    win?.show();
    // win?.webContents.openDevTools(); // Disabled for production
  });

  // Capture renderer crashes
  win.webContents.on('render-process-gone', (event, details) => {
    log.error('RENDERER PROCESS GONE:', JSON.stringify(details));
  });

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    log.error(`FAILED TO LOAD: code=${errorCode}, desc=${errorDescription}, url=${validatedURL}`);
  });

  win.webContents.on('did-finish-load', () => {
    log.info('Page loaded successfully!');
  });

  win.webContents.on('crashed', () => {
    log.error('RENDERER CRASHED!');
  });

  if (process.env.VITE_DEV_SERVER_URL && process.env.VITE_DEV_SERVER_URL.startsWith('http')) {
    log.info('Loading dev server:', process.env.VITE_DEV_SERVER_URL);
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(distPath, 'index.html');
    log.info('Loading production file:', indexPath);
    win.loadFile(indexPath).then(() => {
      log.info('Page loaded successfully!');
    }).catch(err => {
      log.error('Fatal load error:', err);
    });
  }
}

app.on('window-all-closed', () => {
  log.info('All windows closed.');
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
  log.info('App is ready.');
  createWindow();
});
