import { useState, useEffect, useMemo } from 'react'
import { getPartes, fmtFecha, hoy } from '../lib/db.js'
import Banner from './Banner.jsx'

function montajeTxt(f) {
  if (f.montajeNombre) return `${f.montajeNombre}${f.montajeNumero ? ` · ${f.montajeNumero}` : ''}`
  return f.montaje || ''
}

const GRUPOS = [
  { id: 'sitio', icon: '🍽️', label: 'Por sitio' },
  { id: 'montaje', icon: '🏗️', label: 'Por montaje' },
  { id: 'operario', icon: '👷', label: 'Por operario' },
]

export default function Resumenes() {
  const [partes, setPartes] = useState([])
  const [desde, setDesde] = useState(() => hoy().slice(0, 8) + '01') // primer día del mes
  const [hasta, setHasta] = useState(hoy())
  const [agrupar, setAgrupar] = useState('sitio')
  const [detalle, setDetalle] = useState(null) // nombre del grupo abierto

  useEffect(() => { getPartes().then(setPartes) }, [])

  function esteMes() { setDesde(hoy().slice(0, 8) + '01'); setHasta(hoy()) }
  function mesPasado() {
    const d = new Date(); d.setDate(1); d.setDate(0) // último día del mes pasado
    const fin = d.toISOString().slice(0, 10)
    setDesde(fin.slice(0, 8) + '01'); setHasta(fin)
  }
  function todo() { setDesde(''); setHasta('') }

  // Cada comida = una fila de operario en un parte dentro del rango
  const comidas = useMemo(() => {
    const out = []
    partes.forEach(p => {
      if (desde && p.fecha < desde) return
      if (hasta && p.fecha > hasta) return
      p.filas?.forEach(f => {
        if (!f.operario) return
        out.push({
          fecha: p.fecha,
          operario: f.operario,
          sitio: p.sitio || 'Sin sitio',
          montaje: montajeTxt(f) || 'Sin montaje',
          parteId: p.id,
        })
      })
    })
    return out
  }, [partes, desde, hasta])

  // Agrupación
  const grupos = useMemo(() => {
    const m = new Map()
    comidas.forEach(c => {
      const clave = c[agrupar]
      if (!m.has(clave)) m.set(clave, { nombre: clave, comidas: 0, partes: new Set(), dias: new Set() })
      const g = m.get(clave)
      g.comidas += 1
      g.partes.add(c.parteId)
      g.dias.add(c.fecha)
    })
    return [...m.values()]
      .map(g => ({ ...g, partes: g.partes.size, dias: g.dias.size }))
      .sort((a, b) => b.comidas - a.comidas)
  }, [comidas, agrupar])

  const totalComidas = comidas.length

  // Detalle de un grupo: sus comidas una a una
  const comidasDetalle = useMemo(() => {
    if (!detalle) return []
    return comidas.filter(c => c[agrupar] === detalle).sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [comidas, detalle, agrupar])

  const rangoTxt = (desde || hasta)
    ? `${desde ? fmtFecha(desde) : '…'} — ${hasta ? fmtFecha(hasta) : '…'}`
    : 'Todas las fechas'

  // Exportar Excel con formato (colores KAEFER, dos hojas: Resumen y Detalle)
  async function exportarExcel() {
    const ExcelJS = (await import('exceljs')).default
    const ROJO = 'FFE3000F', OSCURO = 'FF1A1A2E', ZEBRA = 'FFF5F6F8', ROJO_CLARO = 'FFFFF0F0'
    const grupoLabel = agrupar === 'sitio' ? 'Sitio' : agrupar === 'montaje' ? 'Montaje' : 'Operario'
    const borde = { style: 'thin', color: { argb: 'FFD8DAE0' } }
    const bordes = { top: borde, bottom: borde, left: borde, right: borde }

    const wb = new ExcelJS.Workbook()

    // ===== Hoja 1: Resumen =====
    const ws = wb.addWorksheet('Resumen')
    ws.columns = [{ width: 38 }, { width: 12 }, { width: 12 }]

    ws.mergeCells('A1:C1')
    const t = ws.getCell('A1')
    t.value = 'KAEFER — RESUMEN DE COMIDAS'
    t.font = { bold: true, size: 15, color: { argb: 'FFFFFFFF' } }
    t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
    t.alignment = { horizontal: 'center', vertical: 'middle' }
    ws.getRow(1).height = 30

    ws.mergeCells('A2:C2')
    ws.getCell('A2').value = `Periodo: ${rangoTxt}   ·   Agrupado por: ${grupoLabel}`
    ws.getCell('A2').font = { italic: true, size: 11, color: { argb: 'FF4A4A6A' } }
    ws.getCell('A2').alignment = { horizontal: 'center' }
    ws.getRow(2).height = 20

    const head = ws.getRow(4)
    head.values = [grupoLabel, 'Días', 'Comidas']
    head.eachCell(c => {
      c.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: OSCURO } }
      c.alignment = { horizontal: 'center', vertical: 'middle' }
      c.border = bordes
    })
    head.height = 22

    grupos.forEach((g, i) => {
      const r = ws.getRow(5 + i)
      r.values = [g.nombre, g.dias, g.comidas]
      r.getCell(1).font = { size: 11 }
      r.getCell(2).alignment = { horizontal: 'center' }
      r.getCell(3).alignment = { horizontal: 'center' }
      r.getCell(3).font = { bold: true, size: 11, color: { argb: ROJO } }
      r.eachCell(c => {
        c.border = bordes
        if (i % 2) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
      })
    })

    const totRow = ws.getRow(5 + grupos.length)
    totRow.values = ['TOTAL', '', totalComidas]
    totRow.eachCell(c => {
      c.font = { bold: true, size: 12 }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO_CLARO } }
      c.border = bordes
    })
    totRow.getCell(3).alignment = { horizontal: 'center' }
    totRow.getCell(3).font = { bold: true, size: 12, color: { argb: ROJO } }
    totRow.height = 22

    // ===== Hoja 2: Detalle =====
    const wd = wb.addWorksheet('Detalle')
    wd.columns = [{ width: 13 }, { width: 36 }, { width: 26 }, { width: 24 }]

    wd.mergeCells('A1:D1')
    const td = wd.getCell('A1')
    td.value = `DETALLE DE COMIDAS · ${rangoTxt}`
    td.font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } }
    td.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROJO } }
    td.alignment = { horizontal: 'center', vertical: 'middle' }
    wd.getRow(1).height = 26

    const headD = wd.getRow(3)
    headD.values = ['Fecha', 'Operario', 'Sitio', 'Montaje']
    headD.eachCell(c => {
      c.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: OSCURO } }
      c.alignment = { horizontal: 'center', vertical: 'middle' }
      c.border = bordes
    })
    headD.height = 22

    const orden = [...comidas].sort((a, b) => a.fecha.localeCompare(b.fecha))
    orden.forEach((c, i) => {
      const r = wd.getRow(4 + i)
      r.values = [fmtFecha(c.fecha), c.operario, c.sitio, c.montaje]
      r.getCell(1).alignment = { horizontal: 'center' }
      r.eachCell(cell => {
        cell.border = bordes
        if (i % 2) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
      })
    })
    wd.autoFilter = 'A3:D3'

    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Resumen_${desde || 'inicio'}_a_${hasta || 'hoy'}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Recuentos por sitio, montaje y operario" titulo="Resúmenes" icon="📊" count={totalComidas} countLabel="Comidas" />

      <div className="page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Filtros */}
        <div className="card">
          <div className="card-body" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '0 0 160px' }}>
              <label>Desde</label>
              <input type="date" className="input" value={desde} onChange={e => setDesde(e.target.value)} />
            </div>
            <div style={{ flex: '0 0 160px' }}>
              <label>Hasta</label>
              <input type="date" className="input" value={hasta} onChange={e => setHasta(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={esteMes}>Este mes</button>
              <button className="btn btn-secondary btn-sm" onClick={mesPasado}>Mes pasado</button>
              <button className="btn btn-ghost btn-sm" onClick={todo}>Todo</button>
            </div>
          </div>
        </div>

        {/* Selector de agrupación + exportar */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          {GRUPOS.map(g => (
            <button key={g.id}
              className={agrupar === g.id ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => { setAgrupar(g.id); setDetalle(null) }}>
              {g.icon} {g.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="btn btn-secondary" onClick={exportarExcel} disabled={!totalComidas}>
            📥 Exportar Excel
          </button>
        </div>

        {/* Tabla resumen */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>
              {GRUPOS.find(g => g.id === agrupar).icon} Resumen {GRUPOS.find(g => g.id === agrupar).label.toLowerCase()} · {rangoTxt}
            </span>
            <span className="chip chip-red" style={{ fontWeight: 700 }}>{totalComidas} comida{totalComidas !== 1 ? 's' : ''}</span>
          </div>
          {grupos.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <div className="empty-text">No hay comidas en ese periodo</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{agrupar === 'sitio' ? 'Sitio' : agrupar === 'montaje' ? 'Montaje' : 'Operario'}</th>
                  <th style={{ width: 110, textAlign: 'center' }}>Días</th>
                  <th style={{ width: 110, textAlign: 'center' }}>Comidas</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {grupos.map(g => (
                  <tr key={g.nombre} style={{ cursor: 'pointer' }} onClick={() => setDetalle(g.nombre)}>
                    <td style={{ fontWeight: 600 }}>{g.nombre}</td>
                    <td style={{ textAlign: 'center' }}>{g.dias}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="chip chip-red" style={{ fontWeight: 800, fontSize: 13 }}>{g.comidas}</span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setDetalle(g.nombre)}>Ver detalle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal detalle */}
      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              📊 {detalle}
              <span className="chip chip-red" style={{ marginLeft: 10, fontWeight: 700 }}>{comidasDetalle.length} comida{comidasDetalle.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text3)', marginBottom: 12 }}>{rangoTxt}</div>
            <div className="table-wrap" style={{ maxHeight: 360, overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    {agrupar !== 'operario' && <th>Operario</th>}
                    {agrupar !== 'sitio' && <th>Sitio</th>}
                    {agrupar !== 'montaje' && <th>Montaje</th>}
                  </tr>
                </thead>
                <tbody>
                  {comidasDetalle.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{fmtFecha(c.fecha)}</td>
                      {agrupar !== 'operario' && <td>{c.operario}</td>}
                      {agrupar !== 'sitio' && <td>{c.sitio}</td>}
                      {agrupar !== 'montaje' && <td>{c.montaje}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button className="btn btn-secondary" onClick={() => setDetalle(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
