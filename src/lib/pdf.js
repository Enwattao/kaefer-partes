import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import plantillaUrl from '../assets/plantilla.pdf?url'
import { fmtFecha } from './db.js'

// Coordenadas medidas sobre el PDF original (origen arriba-izquierda, A4 apaisado 841.89 x 595.28)
const PAGE_H = 595.28

const FILA_TOPS = [
  160.0, 179.6, 199.2, 218.7, 238.3, 257.9, 277.5, 297.1,
  316.6, 336.2, 355.8, 375.4, 395.0, 414.5, 434.1, 453.7,
]
const FILA_BOTTOM = 473.3
const FILA_MAX = FILA_TOPS.length // 16
const TABLA_X0 = 30
const TABLA_X1 = 811.9
const COL_DIV = 499.9

const X_CHECK = 42        // centro del cuadradito
const X_NOMBRE = 58       // inicio columna "Nombre y apellidos" (tras el cuadradito)
const X_MONTAJE = 510
const X_FECHA = 80
const Y_FECHA_TOP = 107.8
const FONT_SIZE = 9.5

function topDe(i) { return FILA_TOPS[i] }
function bottomDe(i) { return i < FILA_MAX - 1 ? FILA_TOPS[i + 1] : FILA_BOTTOM }
function altoDe(i) { return bottomDe(i) - topDe(i) }

function baselineFila(i, size = FONT_SIZE) {
  const centroTop = topDe(i) + altoDe(i) / 2
  return PAGE_H - centroTop - size * 0.35
}

let cachePlantilla = null
async function cargarPlantilla() {
  if (cachePlantilla) return cachePlantilla
  cachePlantilla = await fetch(plantillaUrl).then(r => r.arrayBuffer())
  return cachePlantilla
}

export async function generarParte(parte) {
  const plantillaBytes = await cargarPlantilla()
  const pdfDoc = await PDFDocument.load(plantillaBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const page = pdfDoc.getPages()[0]
  const negro = rgb(0.1, 0.1, 0.13)
  const grisSombra = rgb(0.74, 0.75, 0.78)
  const grisTexto = rgb(0.45, 0.46, 0.52)

  // Fecha
  if (parte.fecha) {
    page.drawText(fmtFecha(parte.fecha), {
      x: X_FECHA, y: PAGE_H - (Y_FECHA_TOP + FONT_SIZE), size: FONT_SIZE, font, color: negro,
    })
  }

  // Sitio de comida — en el lado contrario a la fecha (alineado a la derecha)
  if (parte.sitio) {
    const ySitio = PAGE_H - (Y_FECHA_TOP + FONT_SIZE)
    const wNombre = font.widthOfTextAtSize(parte.sitio, FONT_SIZE)
    const etiqueta = 'SITIO:'
    const wEtiqueta = fontBold.widthOfTextAtSize(etiqueta, FONT_SIZE)
    const xNombre = TABLA_X1 - wNombre
    page.drawText(etiqueta, {
      x: xNombre - wEtiqueta - 6, y: ySitio, size: FONT_SIZE, font: fontBold, color: rgb(0.35, 0.36, 0.42),
    })
    page.drawText(parte.sitio, {
      x: xNombre, y: ySitio, size: FONT_SIZE, font, color: negro,
    })
  }

  const filas = (parte.filas || []).slice(0, FILA_MAX)
  const n = filas.length

  // Filas con operarios: cuadradito vacío + nombre + montaje
  filas.forEach((fila, i) => {
    const base = baselineFila(i)
    if (fila.operario) {
      dibujarCheckbox(page, X_CHECK, i)
      page.drawText(recortar(fila.operario, font, FONT_SIZE, COL_DIV - X_NOMBRE - 6), {
        x: X_NOMBRE, y: base, size: FONT_SIZE, font, color: negro,
      })
    }
    // En el PDF solo sale el NÚMERO de montaje (el nombre es solo para rellenar)
    const montajeTxt = String(fila.montajeNumero ?? fila.montaje ?? '')
    if (montajeTxt) {
      page.drawText(recortar(montajeTxt, font, FONT_SIZE, TABLA_X1 - X_MONTAJE - 6), {
        x: X_MONTAJE, y: base, size: FONT_SIZE, font, color: negro,
      })
    }
  })

  // Fila de recuento: "N Operarios" centrado tras el último
  if (n > 0 && n < FILA_MAX) {
    const texto = `${n} Operario${n !== 1 ? 's' : ''}`
    const size = 10.5
    const w = fontBold.widthOfTextAtSize(texto, size)
    page.drawText(texto, {
      x: (TABLA_X0 + COL_DIV) / 2 - w / 2, y: baselineFila(n, size), size, font: fontBold, color: grisTexto,
    })
  }

  // Filas sobrantes sombreadas (desactivadas)
  const desde = n < FILA_MAX ? n + 1 : FILA_MAX
  for (let i = desde; i < FILA_MAX; i++) {
    const top = topDe(i), h = altoDe(i)
    page.drawRectangle({
      x: TABLA_X0, y: PAGE_H - (top + h), width: TABLA_X1 - TABLA_X0, height: h,
      color: grisSombra, opacity: 0.55,
    })
  }

  const bytes = await pdfDoc.save()
  await abrir(bytes, `Parte_${parte.fecha || 'sin-fecha'}.pdf`)
}

// Cuadradito vacío (para tachar a mano sobre el papel)
function dibujarCheckbox(page, cx, i) {
  const top = topDe(i), h = altoDe(i)
  const cy = PAGE_H - (top + h / 2)
  const lado = 10
  page.drawRectangle({
    x: cx - lado / 2, y: cy - lado / 2, width: lado, height: lado,
    borderColor: rgb(0.45, 0.46, 0.52), borderWidth: 1,
  })
}

function recortar(texto, font, size, maxWidth) {
  if (font.widthOfTextAtSize(texto, size) <= maxWidth) return texto
  let t = texto
  while (t.length > 1 && font.widthOfTextAtSize(t + '…', size) > maxWidth) t = t.slice(0, -1)
  return t + '…'
}

// Abre el PDF para verlo e imprimirlo (no lo descarga)
async function abrir(bytes, nombre) {
  if (typeof window !== 'undefined' && window.api?.abrirPdf) {
    // Electron: escribe a temporal y abre en el visor del sistema
    await window.api.abrirPdf(bytes, nombre)
  } else {
    // Navegador (dev): abre en pestaña nueva
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }
}
