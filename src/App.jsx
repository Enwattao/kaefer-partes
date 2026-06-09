import { useState } from 'react'
import Titlebar from './components/Titlebar.jsx'
import Sidebar from './components/Sidebar.jsx'
import NuevoParte from './components/NuevoParte.jsx'
import Consultas from './components/Consultas.jsx'
import Operarios from './components/Operarios.jsx'
import Montajes from './components/Montajes.jsx'
import Ajustes from './components/Ajustes.jsx'

export default function App() {
  const [pantalla, setPantalla] = useState('nuevo')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Titlebar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar pantalla={pantalla} setPantalla={setPantalla} />
        <main style={{ flex: 1, overflow: 'hidden', background: 'var(--bg)' }}>
          {pantalla === 'nuevo' && <NuevoParte />}
          {pantalla === 'consultas' && <Consultas />}
          {pantalla === 'operarios' && <Operarios />}
          {pantalla === 'montajes' && <Montajes />}
          {pantalla === 'ajustes' && <Ajustes />}
        </main>
      </div>
    </div>
  )
}
