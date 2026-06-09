import { useState, useEffect, useMemo } from 'react'
import { getOperarios, getMontajes, getPartes, savePartes, genId, hoy } from '../lib/db.js'
import { generarParte } from '../lib/pdf.js'
import Autocomplete from './Autocomplete.jsx'
import Banner from './Banner.jsx'

const FILAS_MAX = 16

export default function NuevoParte({ onGuardado }) {
  const [operarios, setOperarios] = useState([])
  const [montajes, setMontajes] = useState([])
  const [partes, setPartes] = useState([])
  const [fecha, setFecha] = useState(hoy())
  const [filas, setFilas] = useState([nuevaFila()])
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    getOperarios().then(setOperarios)
    getMontajes().then(setMontajes)
    getPartes().then(setPartes)
  }, [])

  const opsNombres = operarios.map(o => o.nombre)

  // Opciones de montaje como objetos {label: nombre, sub: "Nº x", raw: montaje}
  const montajeOpts = useMemo(() => montajes.map(m => ({
    label: m.nombre, sub: String(m.numero), raw: m,
  })), [montajes])

  // Más usados (por frecuencia en partes guardados)
  const usadosOp = useMemo(() => frecuencia(partes, f => f.operario), [partes])
  const usadosMon = useMemo(() => {
    const numsOrden = frecuencia(partes, f => f.montajeNumero ?? f.montaje)
    return numsOrden
      .map(num => montajes.find(m => String(m.numero) === String(num)))
      .filter(Boolean)
      .map(m => ({ label: m.nombre, sub: String(m.numero), raw: m }))
  }, [partes, montajes])

  function addFila() { if (filas.length < FILAS_MAX) setFilas(f => [...f, nuevaFila()]) }
  function updateFila(idx, patch) { setFilas(f => f.map((r, i) => i === idx ? { ...r, ...patch } : r)) }
  function removeFila(idx) {
    setFilas(f => f.length === 1 ? [nuevaFila()] : f.filter((_, i) => i !== idx))
  }

  async function guardar(ver = false) {
    const filasValidas = filas.filter(f => f.operario.trim())
    if (!filasValidas.length) return
    setGuardando(true)
    const parte = { id: genId(), fecha, filas: filasValidas, creadoEn: new Date().toISOString() }
    const todos = await getPartes()
    await savePartes([...todos, parte])
    if (ver) await generarParte(parte)
    setGuardando(false)
    setExito(true)
    setTimeout(() => { setExito(false); onGuardado?.() }, 1600)
    setFilas([nuevaFila()])
    setFecha(hoy())
  }

  const nValidos = filas.filter(f => f.operario.trim()).length

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Parte de Comida 2026" titulo="Nuevo Parte" count={nValidos} countLabel="Operarios" />

      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>

        {exito && (
          <div style={{ background: '#F0FDF4', border: '1.5px solid #86EFAC', borderRadius: 10, padding: '13px 18px', color: '#16A34A', fontWeight: 700, display: 'flex', gap: 8, alignItems: 'center' }}>
            ✅ Parte guardado correctamente
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 220px' }}>
            <label>📅 Fecha del parte</label>
            <input type="date" className="input input-lg" value={fecha} onChange={e => setFecha(e.target.value)} />
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn btn-secondary btn-lg" onClick={() => guardar(false)} disabled={!nValidos || guardando}>
            💾 Guardar
          </button>
          <button className="btn btn-primary btn-lg" onClick={() => guardar(true)} disabled={!nValidos || guardando}>
            👁 Guardar y ver parte
          </button>
        </div>

        <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>👷 Operarios del parte</span>
              <span className="chip chip-gray">{filas.length} / {FILAS_MAX}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>En el PDF solo sale el nº de montaje</span>
          </div>

          <div style={{ overflow: 'auto', flex: 1 }}>
            <table style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={thStyle('center', 44)}>#</th>
                  <th style={thStyle('left')}>NOMBRE Y APELLIDOS</th>
                  <th style={thStyle('left')}>MONTAJE</th>
                  <th style={thStyle('center', 50)}></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, idx) => (
                  <tr key={fila.id} style={{ background: idx % 2 ? '#F8F9FB' : '#fff' }}>
                    <td style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12, fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '5px 8px' }}>
                      <Autocomplete
                        value={fila.operario}
                        onChange={v => updateFila(idx, { operario: v })}
                        placeholder="Nombre y apellidos…"
                        opciones={opsNombres}
                        masUsados={usadosOp}
                        icon="👷"
                      />
                    </td>
                    <td style={{ padding: '5px 8px' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                          <Autocomplete
                            value={fila.montajeNombre}
                            onChange={v => updateFila(idx, { montajeNombre: v, montajeNumero: '' })}
                            onPick={m => updateFila(idx, { montajeNombre: m.nombre, montajeNumero: m.numero })}
                            placeholder="Buscar montaje…"
                            opciones={montajeOpts}
                            masUsados={usadosMon}
                            icon="🏗️"
                          />
                        </div>
                        {fila.montajeNumero && (
                          <span className="chip chip-red" style={{ fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{fila.montajeNumero}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', padding: '5px 6px', verticalAlign: 'top' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => removeFila(idx)} style={{ padding: '0 8px' }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Botón debajo de la última fila, baja con la lista */}
            <div style={{ padding: '14px 16px' }}>
              <button className="btn btn-primary btn-lg" onClick={addFila} disabled={filas.length >= FILAS_MAX} style={{ width: '100%' }}>
                + Añadir operario
              </button>
            </div>
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text3)', fontSize: 12.5 }}>
              {nValidos} operario{nValidos !== 1 ? 's' : ''} con nombre
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function nuevaFila() { return { id: genId(), operario: '', montajeNombre: '', montajeNumero: '' } }

function frecuencia(partes, getter) {
  const c = {}
  partes.forEach(p => p.filas?.forEach(f => {
    const v = getter(f)
    if (v) c[v] = (c[v] || 0) + 1
  }))
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k]) => k)
}

function thStyle(align, width) {
  return {
    background: 'var(--dark)', color: '#fff', padding: '10px 10px',
    fontSize: 11, fontWeight: 600, textAlign: align,
    textTransform: 'uppercase', letterSpacing: '.04em',
    ...(width ? { width } : {}),
  }
}
