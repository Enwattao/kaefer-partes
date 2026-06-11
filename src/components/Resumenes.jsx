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

        {/* Selector de agrupación */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {GRUPOS.map(g => (
            <button key={g.id}
              className={agrupar === g.id ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => { setAgrupar(g.id); setDetalle(null) }}>
              {g.icon} {g.label}
            </button>
          ))}
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
