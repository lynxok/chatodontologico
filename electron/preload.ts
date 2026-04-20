import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  openDevTools: () => ipcRenderer.send('open-dev-tools'),
  notifyMessage: () => ipcRenderer.send('notify-message'),
  focusWindow: () => ipcRenderer.send('focus-window'),
  showNotification: (title: string, body: string) => ipcRenderer.send('show-notification', { title, body }),
  setBadgeCount: (count: number) => ipcRenderer.send('set-badge-count', count),
  setOverlayIcon: (dataUrl: string | null) => ipcRenderer.send('set-overlay-icon', dataUrl),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  // Conservamos las demás funciones si existen
  send: (channel: string, data: any) => {
    let validChannels = ['toMain', 'open-dev-tools', 'notify-message', 'focus-window', 'check-for-updates', 'show-notification'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    let validChannels = [
      'fromMain', 
      'update-available', 
      'update-not-available', 
      'update-download-progress', 
      'update-downloaded', 
      'update-error'
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
