import { useState, useEffect } from 'react'
import { getVacaciones, saveVacaciones, fmtFecha } from '../lib/db.js'

const MESES = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function fmtMes(m) {
  return MESES[parseInt(m, 10)] || m
}

export default function ConsultasVacaciones({ onEditar }) {
  const [lista, setLista] = useState([])
  const [buscar, setBuscar] = useState('')
  const [abierto, setAbierto] = useState(null)
  const [confirmElim, setConfirmElim] = useState(null)

  useEffect(() => {
    getVacaciones().then(setLista)
  }, [])

  const filtradas = lista.filter(s => {
    if (!buscar.trim()) return true
    const q = buscar.toLowerCase()
    return (
      s.solicitante?.toLowerCase().includes(q) ||
      s.unidad?.toLowerCase().includes(q)
    )
  })

  async function eliminar(id) {
    const nuevas = lista.filter(s => s.id !== id)
    await saveVacaciones(nuevas)
    setLista(nuevas)
    setAbierto(null)
    setConfirmElim(null)
  }

  if (lista.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <HeaderBanner />
        <div className="empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: 48 }}>🏖️</span>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Sin solicitudes guardadas</div>
          <div style={{ color: 'var(--text2)', fontSize: 13 }}>Crea tu primera solicitud de vacaciones</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)' }}>
      <HeaderBanner count={lista.length} />

      <div style={{ padding: '16px 24px', maxWidth: 720, margin: '0 auto' }}>
        {/* Buscador */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text3)' }}>🔍</span>
          <input
            className="input"
            placeholder="Buscar por nombre o unidad…"
            value={buscar}
            onChange={e => setBuscar(e.target.value)}
            style={{ width: '100%', paddingLeft: 34 }}
          />
        </div>

        {filtradas.length === 0 ? (
          <div className="empty">Sin resultados para "{buscar}"</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtradas.map(s => (
              <div
                key={s.id}
                className="card"
                style={{ cursor: 'pointer', transition: 'box-shadow .15s' }}
                onClick={() => setAbierto(abierto?.id === s.id ? null : s)}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
              >
                <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: 'linear-gradient(135deg, #E3000F, #B8000C)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>🏖️</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{s.solicitante}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{s.unidad}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      background: '#FFF0F0', color: '#E3000F',
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: 11.5, fontWeight: 700, marginBottom: 3,
                    }}>
                      {s.filas?.length} período{s.filas?.length !== 1 ? 's' : ''}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{fmtFecha(s.fechaSolicitud)}</div>
                  </div>
                  <div style={{ color: 'var(--text3)', fontSize: 12, marginLeft: 4 }}>
                    {abierto?.id === s.id ? '▲' : '▼'}
                  </div>
                </div>

                {abierto?.id === s.id && (
                  <div onClick={e => e.stopPropagation()}>
                    {/* Tabla de días */}
                    <div style={{ borderTop: '1px solid var(--border)', padding: '0 16px 12px' }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 80px 60px 1fr',
                        padding: '8px 0 4px',
                        borderBottom: '1px solid var(--border)',
                        marginBottom: 4,
                      }}>
                        {['Día/s', 'Mes', 'Año', 'Tipo'].map((h, i) => (
                          <div key={i} style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</div>
                        ))}
                      </div>
                      {s.filas?.map((f, i) => (
                        <div key={i} style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 80px 60px 1fr',
                          padding: '5px 0',
                          borderBottom: i < s.filas.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{f.dias}</div>
                          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{fmtMes(f.mes)}</div>
                          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{f.ano}</div>
                          <div>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                              background: f.tipo === 'curso' ? '#EFF6FF' : '#F0FDF4',
                              color: f.tipo === 'curso' ? '#2563EB' : '#16A34A',
                            }}>
                              {f.tipo === 'curso' ? 'Año en curso' : 'Año anterior'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Acciones */}
                    <div style={{
                      borderTop: '1px solid var(--border)',
                      padding: '10px 16px',
                      display: 'flex', gap: 8, justifyContent: 'flex-end',
                    }}>
                      {confirmElim === s.id ? (
                        <>
                          <span style={{ fontSize: 12.5, color: 'var(--text2)', alignSelf: 'center', marginRight: 4 }}>¿Eliminar?</span>
                          <button className="btn btn-sm" onClick={() => setConfirmElim(null)}>Cancelar</button>
                          <button className="btn btn-sm" style={{ background: '#E3000F', color: '#fff', border: 'none' }} onClick={() => eliminar(s.id)}>Sí, eliminar</button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                            onClick={() => setConfirmElim(s.id)}
                          >
                            Eliminar
                          </button>
                          <button
                            className="btn btn-sm"
                            style={{ background: 'linear-gradient(135deg,#E3000F,#B8000C)', color: '#fff', border: 'none' }}
                            onClick={() => onEditar(s)}
                          >
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HeaderBanner({ count }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #E3000F 0%, #B8000C 100%)',
      padding: '22px 28px 28px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
        <div style={{
          width: 46, height: 46, borderRadius: 14,
          background: 'rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>📋</div>
        <div>
          <div style={{ color: '#fff', fontSize: 19, fontWeight: 800, lineHeight: 1.1 }}>Solicitudes de vacaciones</div>
          <div style={{ color: 'rgba(255,255,255,.72)', fontSize: 12.5, fontWeight: 500, marginTop: 2 }}>Historial guardado</div>
        </div>
        {count > 0 && (
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,.22)',
            borderRadius: 20, padding: '4px 12px',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>
            {count} solicitud{count !== 1 ? 'es' : ''}
          </div>
        )}
      </div>
    </div>
  )
}
