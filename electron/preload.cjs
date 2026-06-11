const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Ventana
  minimize: () => ipcRenderer.send('win-minimize'),
  maximize: () => ipcRenderer.send('win-maximize'),
  close: () => ipcRenderer.send('win-close'),

  // Datos
  getOperarios: () => ipcRenderer.invoke('get-operarios'),
  saveOperarios: (d) => ipcRenderer.invoke('save-operarios', d),
  getMontajes: () => ipcRenderer.invoke('get-montajes'),
  saveMontajes: (d) => ipcRenderer.invoke('save-montajes', d),
  getSitios: () => ipcRenderer.invoke('get-sitios'),
  saveSitios: (d) => ipcRenderer.invoke('save-sitios', d),
  getPartes: () => ipcRenderer.invoke('get-partes'),
  savePartes: (d) => ipcRenderer.invoke('save-partes', d),
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  abrirPdf: (bytes, nombre) => ipcRenderer.invoke('abrir-pdf', bytes, nombre),
  appVersion: () => ipcRenderer.invoke('app-version'),
  abrirUrl: (url) => ipcRenderer.invoke('abrir-url', url),
  abrirCarpetaDatos: () => ipcRenderer.invoke('abrir-carpeta-datos'),
})
