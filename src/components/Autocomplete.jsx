import { useState, useRef, useEffect } from 'react'

// Normaliza una opción: string → {label}, objeto → tal cual ({label, sub, raw})
function norm(o) { return typeof o === 'string' ? { label: o, raw: o } : o }

// Campo con autocompletado. Al enfocar sin texto → muestra "más usados".
// Al escribir → filtra. Soporta opciones string u objeto {label, sub, raw}.
// onChange(texto): escritura libre. onPick(raw): selección de la lista.
export default function Autocomplete({ value, onChange, onPick, onEnter, placeholder, opciones, masUsados = [], icon, grande = false, autoFocus = false }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function fuera(e) { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  const ops = opciones.map(norm)
  const mu = masUsados.map(norm)
  const txt = (value || '').trim().toLowerCase()
  let lista, etiqueta
  if (txt) {
    lista = ops.filter(o =>
      o.label.toLowerCase().includes(txt) || (o.sub || '').toLowerCase().includes(txt)
    ).slice(0, 20)
    etiqueta = null
  } else {
    lista = mu.slice(0, 12)
    etiqueta = mu.length ? '⚡ Más usados' : null
    if (!lista.length) lista = ops.slice(0, 15)
  }

  function elegir(o) {
    if (onPick) onPick(o.raw)
    else onChange(o.label)
    setAbierto(false)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <input
        className="input"
        style={grande ? { height: 46, fontSize: 15.5, fontWeight: 500 } : { height: 36, fontSize: 13.5 }}
        value={value || ''}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={e => { onChange(e.target.value); setAbierto(true) }}
        onFocus={() => setAbierto(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' && onEnter) {
            // Enter: si hay una única coincidencia la elige; si no, añade lo escrito
            if (txt && lista.length === 1) elegir(lista[0])
            else if ((value || '').trim()) { onEnter(value.trim()); setAbierto(false) }
          }
          if (e.key === 'Escape') setAbierto(false)
        }}
      />
      {abierto && lista.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 60,
          background: '#fff', border: '1.5px solid var(--border)', borderRadius: 8,
          boxShadow: 'var(--shadow-md)', overflow: 'hidden', maxHeight: 240, overflowY: 'auto',
        }}>
          {etiqueta && (
            <div style={{
              padding: '7px 12px', fontSize: 11, fontWeight: 700, color: 'var(--red)',
              textTransform: 'uppercase', letterSpacing: '.04em', background: 'var(--red-light)',
            }}>{etiqueta}</div>
          )}
          {lista.map((o, i) => (
            <div key={i} onMouseDown={() => elegir(o)} style={{
              padding: '9px 12px', cursor: 'pointer', fontSize: 13.5,
              display: 'flex', alignItems: 'center', gap: 8,
              borderTop: i === 0 && !etiqueta ? 'none' : '1px solid var(--border)',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              {icon && <span style={{ opacity: .5 }}>{icon}</span>}
              <span style={{ flex: 1 }}>{o.label}</span>
              {o.sub && <span className="chip chip-gray" style={{ fontSize: 11 }}>{o.sub}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
