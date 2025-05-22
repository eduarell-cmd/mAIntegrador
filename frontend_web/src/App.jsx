import { useEffect, useState } from 'react'

function App() {
  const [mensaje, setMensaje] = useState("Cargando...")

  useEffect(() => {
    fetch("http://localhost:8000/login")
      .then(response => response.json())
      .then(data => setMensaje(data.mensaje))
      .catch(err => setMensaje("No conecto padre"))
  }, [])

  return (
    <div>
      <h1>Hola desde React!</h1>
      <p>Mensaje del backend:</p>
      <h2>{mensaje}</h2>
    </div>
  )
}

export default App
