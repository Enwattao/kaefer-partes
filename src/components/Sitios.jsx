import { useState, useEffect } from 'react'
import { getSitios, saveSitios, genId } from '../lib/db.js'
import Banner from './Banner.jsx'

export default function Sitios() {
  const [items, setItems] = useState([])
  const [nuevo, setNuevo] = useState('')
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [editVal, setEditVal] = useState('')

  useEffect(() => { getSitios().then(setItems) }, [])

  async function persist(next) { setItems(next); await saveSitios(next) }

  function add() {
    const val = nuevo.trim()
    if (!val) return
    if (items.some(i => i.nombre.toLowerCase() === val.toLowerCase())) { setError('Ya existe ese sitio'); return }
    persist([...items, { id: genId(), nombre: val }])
    setNuevo(''); setError('')
  }

  function empezarEdit(item) { setEditId(item.id); setEditVal(item.nombre) }
  function guardarEdit() {
    const val = editVal.trim()
    if (!val) return
    persist(items.map(i => i.id === editId ? { ...i, nombre: val } : i))
    setEditId(null)
  }
  function eliminar(id) { persist(items.filter(i => i.id !== id)); setEditId(null) }

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Gestión" titulo="Sitios de comida" icon="🍽️" count={items.length} countLabel="Sitios" />

      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 720, width: '100%', margin: '0 auto' }}>
        {/* Añadir */}
        <div className="card">
          <div className="card-body" style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                className="input input-lg"
                placeholder="Nombre del restaurante o bar…"
                value={nuevo}
                onChange={e => { setNuevo(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && add()}
                style={{ borderColor: error ? 'var(--red)' : undefined }}
              />
              {error && <div style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}>{error}</div>}
            </div>
            <button className="btn btn-primary btn-lg" onClick={add}>+ Añadir</button>
          </div>
        </div>

        {/* Lista */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Lista de sitios</span>
            <span className="chip chip-gray">{items.length}</span>
          </div>
          {items.length === 0 ? (
            <div className="empty"><div className="empty-icon">🍽️</div><div className="empty-text">Sin sitios todavía</div></div>
          ) : items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              {editId === item.id ? (
                <>
                  <input className="input" value={editVal} autoFocus
                    onChange={e => setEditVal(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && guardarEdit()}
                    style={{ flex: 1 }} />
                  <button className="btn btn-primary btn-sm" onClick={guardarEdit}>✓ Guardar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminar(item.id)}>🗑️ Eliminar</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, cursor: 'pointer' }} onClick={() => empezarEdit(item)}>
                    {item.nombre}
                  </span>
                  <button className="btn btn-secondary btn-sm" onClick={() => empezarEdit(item)} title="Editar">✏️ Editar</button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
