const NAV_COMIDA = [
  { id: 'nuevo', icon: '📝', label: 'Nuevo Parte', desc: 'Crear parte' },
  { id: 'consultas', icon: '🔍', label: 'Consultas', desc: 'Ver guardados' },
  { id: 'resumenes', icon: '📊', label: 'Resúmenes', desc: 'Recuentos y totales' },
  { id: 'operarios', icon: '👷', label: 'Operarios', desc: 'Gestionar personal' },
  { id: 'montajes', icon: '🏗️', label: 'Montajes', desc: 'Nombre y número' },
  { id: 'sitios', icon: '🍽️', label: 'Sitios de comida', desc: 'Dónde se come' },
]

const NAV_VACACIONES = [
  { id: 'vacaciones', icon: '🏖️', label: 'Nueva Solicitud', desc: 'Pedir vacaciones' },
  { id: 'consultas-vacaciones', icon: '📋', label: 'Mis solicitudes', desc: 'Historial' },
]

const NAV_AJUSTES = [
  { id: 'ajustes', icon: '⚙️', label: 'Ajustes', desc: 'Datos y versión' },
]

export default function Sidebar({ pantalla, setPantalla }) {
  function renderGroup(items, _label) {
    return items.map(item => {
      const active = pantalla === item.id
      return (
        <button
          key={item.id}
          onClick={() => setPantalla(item.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 13px',
            borderRadius: 11, border: 'none', cursor: 'pointer',
            background: active ? 'linear-gradient(135deg, #E3000F, #B8000C)' : 'transparent',
            color: active ? '#fff' : 'rgba(255,255,255,.62)',
            fontFamily: 'inherit',
            transition: 'all .15s',
            textAlign: 'left', width: '100%',
            boxShadow: active ? '0 4px 14px rgba(227,0,15,.35)' : 'none',
          }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#fff' } }}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.62)' } }}
        >
          <span style={{ fontSize: 20 }}>{item.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: active ? 700 : 500 }}>{item.label}</div>
            <div style={{ fontSize: 10.5, opacity: active ? .8 : .5 }}>{item.desc}</div>
          </div>
        </button>
      )
    })
  }

  return (
    <div style={{
      width: 'var(--sidebar)',
      background: 'linear-gradient(180deg, #252540 0%, #1A1A2E 100%)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      padding: '18px 12px',
      gap: 6,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '4px 8px 16px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: 'linear-gradient(135deg, #E3000F, #B8000C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontWeight: 800, color: '#fff',
          boxShadow: '0 4px 12px rgba(227,0,15,.4)',
        }}>K</div>
        <div>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, lineHeight: 1.1 }}>KAEFER</div>
          <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10.5, fontWeight: 600, letterSpacing: '.05em' }}>GESTIÓN INTERNA</div>
        </div>
      </div>

      <div style={{ margin: '2px 0 2px', padding: '0 8px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Comida</div>
      </div>
      {renderGroup(NAV_COMIDA)}

      <div style={{ margin: '8px 0 2px', padding: '0 8px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Vacaciones</div>
      </div>
      {renderGroup(NAV_VACACIONES)}

      <div style={{ margin: '8px 0 2px', padding: '0 8px' }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,.3)', letterSpacing: '.08em', textTransform: 'uppercase' }}>General</div>
      </div>
      {renderGroup(NAV_AJUSTES)}

      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ color: 'rgba(255,255,255,.32)', fontSize: 11 }}>v1.0.0 · KAEFER 2026</div>
      </div>
    </div>
  )
}
