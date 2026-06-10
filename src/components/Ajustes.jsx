import { useState, useEffect } from 'react'
import Banner from './Banner.jsx'

const api = typeof window !== 'undefined' ? window.api : null

export default function Ajustes() {
  const [version, setVersion] = useState('1.0.0')
  const [estado, setEstado] = useState(null) // {tipo, msg}
  const [trabajando, setTrabajando] = useState(false)

  useEffect(() => {
    if (api?.appVersion) api.appVersion().then(setVersion)
  }, [])

  async function actualizar() {
    if (!api?.buscarActualizacion) {
      setEstado({ tipo: 'err', msg: 'La actualización solo funciona en la app instalada (no en vista previa).' })
      return
    }
    setTrabajando(true)
    setEstado({ tipo: 'info', msg: '🔍 Comprobando si hay una versión nueva…' })
    try {
      const info = await api.buscarActualizacion()
      if (info.sinReleases) {
        setEstado({ tipo: 'ok', msg: `Aún no hay versiones publicadas. Tienes la ${info.actual}.` })
      } else if (info.hayNueva) {
        setEstado({ tipo: 'info', msg: `⬇ Descargando la versión ${info.version}… La app se reiniciará sola.` })
        await api.instalarActualizacion(info.url)
        // La app se cerrará y reabrirá automáticamente
      } else {
        setEstado({ tipo: 'ok', msg: `✅ Ya tienes la última versión (${info.actual}).` })
      }
    } catch (e) {
      setEstado({ tipo: 'err', msg: 'No se pudo actualizar: ' + e.message })
    } finally {
      setTrabajando(false)
    }
  }

  const colores = {
    ok: { bg: '#F0FDF4', bd: '#86EFAC', tx: '#16A34A' },
    info: { bg: '#EFF6FF', bd: '#93C5FD', tx: '#2563EB' },
    err: { bg: '#FEF2F2', bd: '#FECACA', tx: '#E3000F' },
  }

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Configuración" titulo="Ajustes" icon="⚙️" />

      <div className="page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 680, width: '100%', margin: '0 auto' }}>

        {/* Actualización */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 20 }}>🔄</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Actualizar la aplicación</span>
            <span className="chip chip-gray" style={{ marginLeft: 'auto' }}>v{version}</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13.5, color: 'var(--text2)' }}>
              Pulsa el botón y, si hay una versión más nueva, se descargará e instalará sola. La app se reiniciará al terminar.
            </div>
            <div>
              <button className="btn btn-primary btn-lg" onClick={actualizar} disabled={trabajando}>
                {trabajando ? '⏳ Trabajando…' : '🔄 Buscar e instalar actualización'}
              </button>
            </div>
            {estado && (
              <div style={{
                borderRadius: 8, padding: '12px 16px', fontSize: 13.5, fontWeight: 600,
                background: colores[estado.tipo].bg, color: colores[estado.tipo].tx,
                border: `1.5px solid ${colores[estado.tipo].bd}`,
              }}>
                {estado.msg}
              </div>
            )}
          </div>
        </div>

        {/* Datos */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 20 }}>📁</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Datos de la aplicación</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13.5, color: 'var(--text2)' }}>
              Los operarios, montajes y partes se guardan en la carpeta <strong>datos</strong> junto al programa. Las actualizaciones no borran tus datos.
            </div>
            {api?.abrirCarpetaDatos && (
              <div>
                <button className="btn btn-secondary" onClick={() => api.abrirCarpetaDatos()}>📂 Abrir carpeta de datos</button>
              </div>
            )}
          </div>
        </div>

        {/* Acerca de */}
        <div className="card">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: 'linear-gradient(135deg, #E3000F, #B8000C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
            }}>K</div>
            <div>
              <div style={{ fontWeight: 700 }}>KAEFER — Partes de Comida</div>
              <div style={{ fontSize: 12.5, color: 'var(--text3)' }}>Versión {version} · 2026</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
