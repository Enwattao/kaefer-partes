import { useState, useEffect } from 'react'
import { getMontajes, saveMontajes, genId } from '../lib/db.js'
import Banner from './Banner.jsx'

export default function Montajes() {
  const [items, setItems] = useState([])
  const [nombre, setNombre] = useState('')
  const [numero, setNumero] = useState('')
  const [error, setError] = useState('')
  const [editId, setEditId] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editNumero, setEditNumero] = useState('')

  useEffect(() => { getMontajes().then(setItems) }, [])

  async function persist(next) { setItems(next); await saveMontajes(next) }

  function add() {
    const nom = nombre.trim(), num = numero.trim()
    if (!nom || !num) { setError('Pon nombre y número de montaje'); return }
    if (items.some(i => String(i.numero) === num)) { setError('Ya existe ese número de montaje'); return }
    persist([...items, { id: genId(), nombre: nom, numero: num }])
    setNombre(''); setNumero(''); setError('')
  }

  function empezarEdit(item) { setEditId(item.id); setEditNombre(item.nombre); setEditNumero(String(item.numero)) }
  function guardarEdit() {
    const nom = editNombre.trim(), num = editNumero.trim()
    if (!nom || !num) return
    persist(items.map(i => i.id === editId ? { ...i, nombre: nom, numero: num } : i))
    setEditId(null)
  }
  function eliminar(id) { persist(items.filter(i => i.id !== id)); setEditId(null) }

  return (
    <div className="fade-in" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Banner sub="Gestión" titulo="Montajes" icon="🏗️" count={items.length} countLabel="Montajes" />

      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760, width: '100%', margin: '0 auto' }}>
        {/* Añadir */}
        <div className="card">
          <div className="card-body" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 280px' }}>
              <label>Nombre del montaje</label>
              <input className="input input-lg" placeholder="Ej: Refinería Cartagena"
                value={nombre} onChange={e => { setNombre(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && add()} />
            </div>
            <div style={{ flex: '0 0 160px' }}>
              <label>Nº de montaje</label>
              <input className="input input-lg" placeholder="Ej: 1234"
                value={numero} onChange={e => { setNumero(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && add()} />
            </div>
            <button className="btn btn-primary btn-lg" onClick={add} style={{ alignSelf: 'flex-end' }}>+ Añadir</button>
            {error && <div style={{ color: 'var(--red)', fontSize: 12, width: '100%' }}>{error}</div>}
          </div>
        </div>

        {/* Lista */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700 }}>Lista de montajes</span>
            <span className="chip chip-gray">{items.length}</span>
          </div>
          {items.length === 0 ? (
            <div className="empty"><div className="empty-icon">🏗️</div><div className="empty-text">Sin montajes todavía</div></div>
          ) : items.map(item => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              {editId === item.id ? (
                <>
                  <input className="input" value={editNombre} autoFocus placeholder="Nombre"
                    onChange={e => setEditNombre(e.target.value)} style={{ flex: 1 }} />
                  <input className="input" value={editNumero} placeholder="Nº"
                    onChange={e => setEditNumero(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && guardarEdit()} style={{ width: 120 }} />
                  <button className="btn btn-primary btn-sm" onClick={guardarEdit}>✓ Guardar</button>
                  <button className="btn btn-danger btn-sm" onClick={() => eliminar(item.id)}>🗑️</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, cursor: 'pointer' }} onClick={() => empezarEdit(item)}>
                    {item.nombre}
                  </span>
                  <span className="chip chip-red" style={{ fontWeight: 700 }}>Nº {item.numero}</span>
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
