const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

const isDev = process.env.NODE_ENV === 'development'

// En portable, datos junto al .exe real (PORTABLE_EXECUTABLE_DIR lo da electron-builder).
const portableDir = process.env.PORTABLE_EXECUTABLE_DIR
const dataDir = isDev
  ? path.join(__dirname, '..', 'datos')
  : path.join(portableDir || path.dirname(process.execPath), 'datos')

function ensureDataDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  const seedDir = path.join(__dirname, 'seed')
  // operarios y montajes: si no existen, copiar la lista inicial (seed). partes: vacío.
  const conSeed = ['operarios.json', 'montajes.json']
  conSeed.forEach(f => {
    const fp = path.join(dataDir, f)
    if (!fs.existsSync(fp)) {
      const seedFp = path.join(seedDir, f)
      fs.writeFileSync(fp, fs.existsSync(seedFp) ? fs.readFileSync(seedFp) : '[]')
    }
  })
  const partesFp = path.join(dataDir, 'partes.json')
  if (!fs.existsSync(partesFp)) fs.writeFileSync(partesFp, '[]', 'utf-8')
  const sitiosFp = path.join(dataDir, 'sitios.json')
  if (!fs.existsSync(sitiosFp)) fs.writeFileSync(sitiosFp, '[]', 'utf-8')
}

function readJson(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf-8'))
  } catch { return [] }
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(dataDir, name), JSON.stringify(data, null, 2), 'utf-8')
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#F8F9FA',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // Exponer controles de ventana al renderer
  ipcMain.on('win-minimize', () => win.minimize())
  ipcMain.on('win-maximize', () => win.isMaximized() ? win.unmaximize() : win.maximize())
  ipcMain.on('win-close', () => win.close())
}

app.whenReady().then(() => {
  ensureDataDir()
  createWindow()
})

app.on('window-all-closed', () => app.quit())

// IPC — CRUD
ipcMain.handle('get-operarios', () => readJson('operarios.json'))
ipcMain.handle('save-operarios', (_, data) => { writeJson('operarios.json', data); return true })

ipcMain.handle('get-montajes', () => readJson('montajes.json'))
ipcMain.handle('save-montajes', (_, data) => { writeJson('montajes.json', data); return true })

ipcMain.handle('get-sitios', () => readJson('sitios.json'))
ipcMain.handle('save-sitios', (_, data) => { writeJson('sitios.json', data); return true })

ipcMain.handle('get-partes', () => readJson('partes.json'))
ipcMain.handle('save-partes', (_, data) => { writeJson('partes.json', data); return true })

ipcMain.handle('get-data-path', () => dataDir)

// Escribe el PDF a un temporal y lo abre en el visor del sistema (para ver e imprimir)
ipcMain.handle('abrir-pdf', async (_, bytes, nombre) => {
  const dir = path.join(os.tmpdir(), 'kaefer-partes')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const filePath = path.join(dir, nombre)
  fs.writeFileSync(filePath, Buffer.from(bytes))
  await shell.openPath(filePath)
  return filePath
})

// Ajustes: versión, abrir URL externa, abrir carpeta de datos
ipcMain.handle('app-version', () => app.getVersion())
ipcMain.handle('abrir-url', (_, url) => shell.openExternal(url))
ipcMain.handle('abrir-carpeta-datos', () => shell.openPath(dataDir))
