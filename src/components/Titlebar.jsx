export default function Titlebar() {
  const isElectron = typeof window !== 'undefined' && window.api

  return (
    <div className="titlebar" style={{
      height: 'var(--topbar)',
      background: 'var(--dark)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28,
          background: 'var(--red)',
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff',
        }}>K</div>
        <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, opacity: .9 }}>
          KAEFER — Partes de Comida
        </span>
      </div>

      {isElectron && (
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '─', action: () => window.api.minimize(), title: 'Minimizar' },
            { label: '□', action: () => window.api.maximize(), title: 'Maximizar' },
            { label: '✕', action: () => window.api.close(), title: 'Cerrar', danger: true },
          ].map(b => (
            <button key={b.label} title={b.title} onClick={b.action} style={{
              width: 28, height: 28, border: 'none', borderRadius: 6,
              background: b.danger ? 'transparent' : 'transparent',
              color: '#fff', cursor: 'pointer', fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: .7, transition: 'all .15s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = b.danger ? 'var(--red)' : 'rgba(255,255,255,.15)'
                e.currentTarget.style.opacity = '1'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.opacity = '.7'
              }}>
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
