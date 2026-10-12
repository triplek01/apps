const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('focusBeatStorage', Object.freeze({
  read: () => ipcRenderer.invoke('focus-beat:read'),
  write: data => ipcRenderer.invoke('focus-beat:write', data),
}));
