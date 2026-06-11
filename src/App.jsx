import { useState, useEffect } from 'react'
import Titlebar from './components/Titlebar.jsx'
import Sidebar from './components/Sidebar.jsx'
import BottomNav from './components/BottomNav.jsx'
import NuevoParte from './components/NuevoParte.jsx'
import Consultas from './components/Consultas.jsx'
import Operarios from './components/Operarios.jsx'
import Montajes from './components/Montajes.jsx'
import Sitios from './components/Sitios.jsx'
import Resumenes from './components/Resumenes.jsx'
import Ajustes from './components/Ajustes.jsx'

function useMovil() {
  const [movil, setMovil] = useState(() => window.matchMedia('(max-width: 700px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    const fn = e => setMovil(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return movil
}

export default function App() {
  const [pantalla, setPantalla] = useState('nuevo')
  const [parteEditar, setParteEditar] = useState(null)
  const movil = useMovil()

  function navegar(id) {
    if (id === 'nuevo') setParteEditar(null) // "Nuevo Parte" del menú siempre empieza en blanco
    setPantalla(id)
  }

  function editarParte(p) {
    setParteEditar(p)
    setPantalla('nuevo')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Titlebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {!movil && <Sidebar pantalla={pantalla} setPantalla={navegar} />}
        <main style={{
          flex: 1, overflow: 'hidden', background: 'var(--bg)',
          paddingBottom: movil ? 'calc(54px + env(safe-area-inset-bottom, 0px))' : 0,
        }}>
          {pantalla === 'nuevo' && (
            <NuevoParte
              key={parteEditar ? parteEditar.id : 'nuevo'}
              parteEditar={parteEditar}
              onTerminado={() => { setParteEditar(null); setPantalla('consultas') }}
            />
          )}
          {pantalla === 'consultas' && <Consultas onEditar={editarParte} />}
          {pantalla === 'resumenes' && <Resumenes />}
          {pantalla === 'operarios' && <Operarios />}
          {pantalla === 'montajes' && <Montajes />}
          {pantalla === 'sitios' && <Sitios />}
          {pantalla === 'ajustes' && <Ajustes />}
        </main>
      </div>
      {movil && <BottomNav pantalla={pantalla} setPantalla={navegar} />}
    </div>
  )
}
