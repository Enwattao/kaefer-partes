import { useState, useEffect } from 'react'
import { getOperarios, getVacaciones, saveVacaciones, genId, hoy } from '../lib/db.js'
import Autocomplete from './Autocomplete.jsx'

const UNIDADES = [
  'ASTURIAS',
  'CATALUÑA (Barcelona)',
  'CATALUÑA (Tarragona)',
  'GALICIA',
  'LEVANTE (Cartagena)',
  'LEVANTE (Baleares)',
  'MADRID',
  'PAIS VASCO',
  'PROYECTOS SINGULARES',
  'TALLER CENTRAL',
  'SUR (Cádiz)',
  'SUR (Huelva)',
]

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function filaVacia() {
  return { id: genId(), dias: '', mes: '', ano: '', tipo: 'curso' }
}

export default function NuevoVacaciones({ solicitudEditar, onTerminado }) {
  const [operarios, setOperarios] = useState([])
  const [solicitante, setSolicitante] = useState('')
  const [fechaSolicitud, setFechaSolicitud] = useState(hoy())
  const [unidad, setUnidad] = useState('')
  const [filas, setFilas] = useState([filaVacia(), filaVacia(), filaVacia()])
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    getOperarios().then(ops => setOperarios(ops.map(o => o.nombre)))
  }, [])

  useEffect(() => {
    if (solicitudEditar) {
      setSolicitante(solicitudEditar.solicitante || '')
      setFechaSolicitud(solicitudEditar.fechaSolicitud || hoy())
      setUnidad(solicitudEditar.unidad || '')
      setFilas(solicitudEditar.filas?.length ? solicitudEditar.filas : [filaVacia()])
    }
  }, [solicitudEditar])

  function actualizarFila(idx, campo, valor) {
    setFilas(prev => prev.map((f, i) => i === idx ? { ...f, [campo]: valor } : f))
  }

  function addFila() {
    setFilas(prev => [...prev, filaVacia()])
  }

  function removeFila(idx) {
    setFilas(prev => prev.filter((_, i) => i !== idx))
  }

  const filasValidas = filas.filter(f => f.dias.trim())

  async function guardar() {
    if (!solicitante.trim() || !unidad || filasValidas.length === 0) return
    setGuardando(true)
    const todas = await getVacaciones()
    const nueva = {
      id: solicitudEditar?.id || genId(),
      solicitante: solicitante.trim(),
      fechaSolicitud,
      unidad,
      filas: filas.filter(f => f.dias.trim()),
      creadoEn: solicitudEditar?.creadoEn || new Date().toISOString(),
    }
    const actualizado = solicitudEditar
      ? todas.map(s => s.id === solicitudEditar.id ? nueva : s)
      : [nueva, ...todas]
    await saveVacaciones(actualizado)
    setGuardando(false)
    setOk(true)
    setTimeout(() => {
      setOk(false)
      onTerminado?.()
    }, 1600)
  }

  const esEditar = !!solicitudEditar
  const puedeGuardar = solicitante.trim() && unidad && filasValidas.length > 0

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #E3000F 0%, #B8000C 100%)',
        padding: '22px 28px 28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -30, right: -20,
          width: 130, height: 130, borderRadius: '50%',
          background: 'rgba(255,255,255,.07)',
        }} />
        <div style={{
          position: 'absolute', bottom: -50, right: 60,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,.05)',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: 'rgba(255,255,255,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>🏖️</div>
          <div>
            <div style={{ color: '#fff', fontSize: 19, fontWeight: 800, lineHeight: 1.1 }}>
              {esEditar ? 'Modificar Solicitud' : 'Nueva Solicitud'}
            </div>
            <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, fontWeight: 500, marginTop: 2 }}>
              Vacaciones · KAEFER
            </div>
          </div>
          {filasValidas.length > 0 && (
            <div style={{
              marginLeft: 'auto',
              background: 'rgba(255,255,255,.22)',
              borderRadius: 20, padding: '4px 12px',
              color: '#fff', fontSize: 12, fontWeight: 700,
            }}>
              {filasValidas.length} período{filasValidas.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 720, margin: '0 auto' }}>

        {/* Datos del solicitante */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: 13 }}>Datos del solicitante</span>
          </div>
          <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Solicitante *
              </label>
              <Autocomplete
                value={solicitante}
                onChange={setSolicitante}
                opciones={operarios}
                placeholder="Nombre del trabajador…"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Fecha de solicitud
              </label>
              <input
                type="date"
                className="input"
                value={fechaSolicitud}
                onChange={e => setFechaSolicitud(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Unidad de negocio */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header">
            <span style={{ fontWeight: 700, fontSize: 13 }}>Unidad de negocio *</span>
          </div>
          <div className="card-body">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 8,
            }}>
              {UNIDADES.map(u => {
                const sel = unidad === u
                return (
                  <button
                    key={u}
                    onClick={() => setUnidad(u)}
                    style={{
                      padding: '9px 13px',
                      borderRadius: 9,
                      border: `2px solid ${sel ? '#E3000F' : 'var(--border)'}`,
                      background: sel ? 'linear-gradient(135deg, #E3000F, #B8000C)' : 'var(--white)',
                      color: sel ? '#fff' : 'var(--text)',
                      fontSize: 12.5, fontWeight: sel ? 700 : 500,
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit',
                      transition: 'all .15s',
                      boxShadow: sel ? '0 3px 10px rgba(227,0,15,.3)' : 'none',
                    }}
                  >
                    {u}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filas de vacaciones */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Días solicitados</span>
            <button
              className="btn btn-sm"
              onClick={addFila}
              style={{ fontSize: 12, padding: '5px 12px' }}
            >
              + Añadir fila
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>

            {/* Cabecera tabla */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 120px 90px 1fr 36px',
              gap: 0,
              padding: '8px 16px',
              background: 'var(--bg)',
              borderBottom: '1px solid var(--border)',
            }}>
              {['Día/s o intervalo', 'Mes', 'Año', 'Tipo de vacaciones', ''].map((h, i) => (
                <div key={i} style={{
                  fontSize: 10.5, fontWeight: 700, color: 'var(--text2)',
                  textTransform: 'uppercase', letterSpacing: '.05em',
                  padding: '0 6px',
                }}>{h}</div>
              ))}
            </div>

            {filas.map((fila, idx) => (
              <div
                key={fila.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px 90px 1fr 36px',
                  gap: 0,
                  padding: '7px 10px',
                  borderBottom: idx < filas.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'center',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,.015)',
                }}
              >
                <div style={{ padding: '0 4px' }}>
                  <input
                    className="input"
                    placeholder="Ej: 1-5 o 14"
                    value={fila.dias}
                    onChange={e => actualizarFila(idx, 'dias', e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                  />
                </div>
                <div style={{ padding: '0 4px' }}>
                  <select
                    className="input"
                    value={fila.mes}
                    onChange={e => actualizarFila(idx, 'mes', e.target.value)}
                    style={{ width: '100%', fontSize: 13 }}
                  >
                    <option value="">—</option>
                    {MESES.map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                    ))}
                  </select>
                </div>
                <div style={{ padding: '0 4px' }}>
                  <input
                    className="input"
                    placeholder={String(new Date().getFullYear())}
                    value={fila.ano}
                    onChange={e => actualizarFila(idx, 'ano', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    style={{ width: '100%', fontSize: 13, textAlign: 'center' }}
                    maxLength={4}
                  />
                </div>
                <div style={{ padding: '0 4px', display: 'flex', gap: 6 }}>
                  {[
                    { v: 'curso', label: 'Año en curso' },
                    { v: 'anterior', label: 'Año anterior' },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => actualizarFila(idx, 'tipo', opt.v)}
                      style={{
                        flex: 1, padding: '6px 6px',
                        borderRadius: 7,
                        border: `1.5px solid ${fila.tipo === opt.v ? '#E3000F' : 'var(--border)'}`,
                        background: fila.tipo === opt.v ? '#FFF0F0' : 'transparent',
                        color: fila.tipo === opt.v ? '#E3000F' : 'var(--text2)',
                        fontSize: 11, fontWeight: fila.tipo === opt.v ? 700 : 500,
                        cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all .12s',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div style={{ padding: '0 2px', display: 'flex', justifyContent: 'center' }}>
                  {filas.length > 1 && (
                    <button
                      onClick={() => removeFila(idx)}
                      style={{
                        width: 28, height: 28, borderRadius: 7,
                        border: 'none', background: 'transparent',
                        color: 'var(--text3)', cursor: 'pointer',
                        fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all .12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F0'; e.currentTarget.style.color = '#E3000F' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text3)' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nota */}
        <div style={{
          background: '#FFFBF0',
          border: '1px solid #F0D060',
          borderRadius: 10,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>
          <p style={{ margin: 0, fontSize: 12, color: '#7A6010', lineHeight: 1.5 }}>
            Para que la solicitud sea considerada aceptada y el trabajador pueda disfrutar de los días
            solicitados, será requisito imprescindible que se encuentre firmada por el Autorizador.
          </p>
        </div>

        {/* Botón guardar */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingBottom: 24 }}>
          {onTerminado && (
            <button className="btn" style={{ background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' }} onClick={onTerminado}>
              Cancelar
            </button>
          )}
          <button
            className="btn btn-lg"
            onClick={guardar}
            disabled={!puedeGuardar || guardando || ok}
            style={{
              background: ok
                ? 'linear-gradient(135deg, #16a34a, #15803d)'
                : 'linear-gradient(135deg, #E3000F, #B8000C)',
              color: '#fff',
              minWidth: 160,
              opacity: !puedeGuardar ? .45 : 1,
              boxShadow: puedeGuardar ? '0 4px 16px rgba(227,0,15,.35)' : 'none',
              transition: 'all .2s',
            }}
          >
            {ok ? '✓ Guardado' : guardando ? 'Guardando…' : esEditar ? 'Guardar cambios' : 'Guardar solicitud'}
          </button>
        </div>
      </div>
    </div>
  )
}
