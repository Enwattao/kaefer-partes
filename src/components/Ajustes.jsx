import { useState, useEffect } from 'react'
import Banner from './Banner.jsx'

const api = typeof window !== 'undefined' ? window.api : null

export default function Ajustes() {
  const [version, setVersion] = useState('—')

  useEffect(() => {
    if (api?.appVersion) api.appVersion().then(setVersion)
  }, [])

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Configuración" titulo="Ajustes" icon="⚙️" />

      <div className="page-pad" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 680, width: '100%', margin: '0 auto' }}>

        {/* Datos */}
        <div className="card">
          <div className="card-header">
            <span style={{ fontSize: 20 }}>📁</span>
            <span style={{ fontWeight: 700, fontSize: 16 }}>Datos de la aplicación</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 13.5, color: 'var(--text2)' }}>
              La app funciona <strong>100% sin internet</strong>. Los operarios, montajes, sitios y partes se guardan
              en la carpeta <strong>datos</strong> junto al programa — cópiala para hacer una copia de seguridad.
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
