// Capa de acceso a datos — usa window.api (Electron IPC) o localStorage (web/PWA)
import seedOperarios from '../seed/operarios.json'
import seedMontajes from '../seed/montajes.json'
import seedSitios from '../seed/sitios.json'

const isElectron = typeof window !== 'undefined' && window.api

// En web: si la clave no existe todavía (primera vez), se carga la lista inicial
function leerConSeed(clave, seed) {
  const raw = localStorage.getItem(clave)
  if (raw === null) {
    localStorage.setItem(clave, JSON.stringify(seed))
    return JSON.parse(JSON.stringify(seed))
  }
  return JSON.parse(raw)
}

export async function getOperarios() {
  if (isElectron) return window.api.getOperarios()
  return leerConSeed('operarios', seedOperarios)
}
export async function saveOperarios(data) {
  if (isElectron) return window.api.saveOperarios(data)
  localStorage.setItem('operarios', JSON.stringify(data))
}

export async function getMontajes() {
  if (isElectron) return window.api.getMontajes()
  return leerConSeed('montajes', seedMontajes)
}
export async function saveMontajes(data) {
  if (isElectron) return window.api.saveMontajes(data)
  localStorage.setItem('montajes', JSON.stringify(data))
}

export async function getSitios() {
  if (isElectron) return window.api.getSitios()
  return leerConSeed('sitios', seedSitios)
}
export async function saveSitios(data) {
  if (isElectron) return window.api.saveSitios(data)
  localStorage.setItem('sitios', JSON.stringify(data))
}

export async function getPartes() {
  if (isElectron) return window.api.getPartes()
  return JSON.parse(localStorage.getItem('partes') || '[]')
}
export async function savePartes(data) {
  if (isElectron) return window.api.savePartes(data)
  localStorage.setItem('partes', JSON.stringify(data))
}

export async function getVacaciones() {
  if (isElectron) return window.api.getVacaciones ? window.api.getVacaciones() : JSON.parse(localStorage.getItem('vacaciones') || '[]')
  return JSON.parse(localStorage.getItem('vacaciones') || '[]')
}
export async function saveVacaciones(data) {
  if (isElectron && window.api.saveVacaciones) return window.api.saveVacaciones(data)
  localStorage.setItem('vacaciones', JSON.stringify(data))
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
