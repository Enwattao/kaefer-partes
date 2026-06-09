export default function Banner({ sub, titulo, icon, count, countLabel }) {
  return (
    <div style={{
      background: 'linear-gradient(120deg, #E3000F 0%, #B8000C 100%)',
      padding: '26px 32px', color: '#fff', position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', right: -30, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.07)' }} />
      <div style={{ position: 'absolute', right: 80, bottom: -60, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', opacity: .85, textTransform: 'uppercase' }}>{sub}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
            {icon && <span>{icon}</span>}{titulo}
          </h1>
        </div>
        {count != null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{count}</div>
            <div style={{ fontSize: 11, opacity: .85, textTransform: 'uppercase', letterSpacing: '.05em' }}>{countLabel}</div>
          </div>
        )}
      </div>
    </div>
  )
}
