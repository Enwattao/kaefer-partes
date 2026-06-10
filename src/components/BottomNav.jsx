const NAV = [
  { id: 'nuevo', icon: '📝', label: 'Nuevo' },
  { id: 'consultas', icon: '🔍', label: 'Consultas' },
  { id: 'operarios', icon: '👷', label: 'Operarios' },
  { id: 'montajes', icon: '🏗️', label: 'Montajes' },
  { id: 'sitios', icon: '🍽️', label: 'Sitios' },
  { id: 'ajustes', icon: '⚙️', label: 'Ajustes' },
]

export default function BottomNav({ pantalla, setPantalla }) {
  return (
    <nav style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 80,
      background: 'var(--dark2)',
      borderTop: '1px solid rgba(255,255,255,.08)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {NAV.map(item => {
        const active = pantalla === item.id
        return (
          <button
            key={item.id}
            onClick={() => setPantalla(item.id)}
            style={{
              flex: 1, border: 'none', cursor: 'pointer',
              background: 'transparent',
              padding: '8px 2px 9px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? '#fff' : 'rgba(255,255,255,.55)',
              fontFamily: 'inherit',
            }}
          >
            <span style={{
              fontSize: 19, lineHeight: 1,
              width: 38, height: 26, borderRadius: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'var(--red)' : 'transparent',
              transition: 'background .15s',
            }}>{item.icon}</span>
            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500 }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
