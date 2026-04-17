import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  openDevTools: () => ipcRenderer.send('open-dev-tools'),
  // Conservamos las demás funciones si existen
  send: (channel: string, data: any) => {
    let validChannels = ['toMain', 'open-dev-tools'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel: string, func: (...args: any[]) => void) => {
    let validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  }
});
