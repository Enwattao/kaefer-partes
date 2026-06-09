// Capa de acceso a datos — usa window.api (Electron IPC) o localStorage (dev web)
const isElectron = typeof window !== 'undefined' && window.api

export async function getOperarios() {
  if (isElectron) return window.api.getOperarios()
  return JSON.parse(localStorage.getItem('operarios') || '[]')
}
export async function saveOperarios(data) {
  if (isElectron) return window.api.saveOperarios(data)
  localStorage.setItem('operarios', JSON.stringify(data))
}

export async function getMontajes() {
  if (isElectron) return window.api.getMontajes()
  return JSON.parse(localStorage.getItem('montajes') || '[]')
}
export async function saveMontajes(data) {
  if (isElectron) return window.api.saveMontajes(data)
  localStorage.setItem('montajes', JSON.stringify(data))
}

export async function getPartes() {
  if (isElectron) return window.api.getPartes()
  return JSON.parse(localStorage.getItem('partes') || '[]')
}
export async function savePartes(data) {
  if (isElectron) return window.api.savePartes(data)
  localStorage.setItem('partes', JSON.stringify(data))
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export function fmtFecha(str) {
  if (!str) return ''
  const [y, m, d] = str.split('-')
  return `${d}/${m}/${y}`
}
