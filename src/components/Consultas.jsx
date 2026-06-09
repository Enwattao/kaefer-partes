import { useState, useEffect, useMemo } from 'react'
import { getPartes, savePartes, getOperarios, getMontajes, fmtFecha } from '../lib/db.js'
import { generarParte } from '../lib/pdf.js'
import Banner from './Banner.jsx'
import Autocomplete from './Autocomplete.jsx'

// Texto del montaje para mostrar (nombre + nº). Compatible con datos antiguos.
function montajeTxt(f) {
  if (f.montajeNombre) return `${f.montajeNombre}${f.montajeNumero ? ` · Nº ${f.montajeNumero}` : ''}`
  return f.montaje || ''
}
function montajeCoincide(f, q) {
  const t = q.toLowerCase()
  return (f.montajeNombre || '').toLowerCase().includes(t)
    || String(f.montajeNumero || '').toLowerCase().includes(t)
    || (f.montaje || '').toLowerCase().includes(t)
}

export default function Consultas() {
  const [partes, setPartes] = useState([])
  const [filtrFecha, setFiltrFecha] = useState('')
  const [filtrOp, setFiltrOp] = useState('')
  const [filtrMon, setFiltrMon] = useState('')
  const [selParte, setSelParte] = useState(null)
  const [confirmarBorrar, setConfirmarBorrar] = useState(null)
  const [operarios, setOperarios] = useState([])
  const [montajes, setMontajes] = useState([])

  useEffect(() => {
    getPartes().then(setPartes)
    getOperarios().then(setOperarios)
    getMontajes().then(setMontajes)
  }, [])

  // Sugerencias para los filtros (lista completa de operarios y montajes)
  const opsOptions = useMemo(() => operarios.map(o => o.nombre), [operarios])
  const monOptions = useMemo(() => montajes.map(m => ({ label: m.nombre, sub: String(m.numero), raw: m.nombre })), [montajes])

  const filtrados = useMemo(() => {
    return partes.filter(p => {
      if (filtrFecha && !p.fecha.includes(filtrFecha)) return false
      if (filtrOp && !p.filas?.some(f => f.operario?.toLowerCase().includes(filtrOp.toLowerCase()))) return false
      if (filtrMon && !p.filas?.some(f => montajeCoincide(f, filtrMon))) return false
      return true
    }).sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [partes, filtrFecha, filtrOp, filtrMon])

  async function borrar(id) {
    const nuevo = partes.filter(p => p.id !== id)
    await savePartes(nuevo)
    setPartes(nuevo)
    setConfirmarBorrar(null)
    if (selParte?.id === id) setSelParte(null)
  }

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Partes guardados" titulo="Consultas" icon="🔍" count={partes.length} countLabel="Partes" />

      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Filtros */}
      <div className="card">
        <div className="card-body" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '0 0 160px' }}>
            <label>Fecha</label>
            <input type="date" className="input" value={filtrFecha} onChange={e => setFiltrFecha(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label>Operario</label>
            <Autocomplete value={filtrOp} onChange={setFiltrOp} placeholder="Buscar por nombre…"
              opciones={opsOptions} icon="👷" />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label>Montaje</label>
            <Autocomplete value={filtrMon} onChange={setFiltrMon} onPick={setFiltrMon} placeholder="Buscar por montaje…"
              opciones={monOptions} icon="🏗️" />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { setFiltrFecha(''); setFiltrOp(''); setFiltrMon('') }}>
            ✕ Limpiar
          </button>
        </div>
      </div>

      {/* Lista de partes */}
      {filtrados.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No hay partes que coincidan</div>
            <div style={{ color: 'var(--text3)', fontSize: 12.5 }}>Prueba a cambiar los filtros</div>
          </div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Operarios</th>
                <th>Montajes</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => {
                const montajesUnicos = [...new Set(p.filas?.map(montajeTxt).filter(Boolean))]
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelParte(p)}>
                    <td>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{fmtFecha(p.fecha)}</span>
                    </td>
                    <td>
                      <span className="chip chip-blue">{p.filas?.filter(f => f.operario).length} operarios</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                        {montajesUnicos.slice(0, 3).map(m => (
                          <span key={m} className="chip chip-gray">{m}</span>
                        ))}
                        {montajesUnicos.length > 3 && <span className="chip chip-gray">+{montajesUnicos.length - 3}</span>}
                      </div>
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => generarParte(p)} title="Ver e imprimir">
                          👁 Ver
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmarBorrar(p)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle */}
      {selParte && (
        <div className="modal-overlay" onClick={() => setSelParte(null)}>
          <div className="modal" style={{ maxWidth: 640, minWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              📋 Parte del {fmtFecha(selParte.fecha)}
            </div>
            <div className="table-wrap" style={{ maxHeight: 340, overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>#</th>
                    <th>Nombre y Apellidos</th>
                    <th>Montaje</th>
                  </tr>
                </thead>
                <tbody>
                  {selParte.filas?.map((f, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{f.operario}</td>
                      <td>{montajeTxt(f)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setSelParte(null)}>Cerrar</button>
              <button className="btn btn-primary" onClick={() => generarParte(selParte)}>👁 Ver e imprimir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar borrar */}
      {confirmarBorrar && (
        <div className="modal-overlay" onClick={() => setConfirmarBorrar(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-title">⚠️ Eliminar parte</div>
            <p style={{ color: 'var(--text2)', marginBottom: 20 }}>
              ¿Seguro que quieres eliminar el parte del <strong>{fmtFecha(confirmarBorrar.fecha)}</strong>? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmarBorrar(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => borrar(confirmarBorrar.id)}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
