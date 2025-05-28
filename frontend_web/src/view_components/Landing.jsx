import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import React from 'react'

export default function Landing() {
    const [mensaje, setMensaje] = useState("Cargando...")

  useEffect(() => {
    fetch("http://localhost:8000")
      .then(response => response.json())
      .then(data => setMensaje(data.mensaje))
      .catch(err => setMensaje("No conecto padre"))
  }, [])

  return (
    <div>
        <h1>Bienvenido a mirrOS</h1>
        <h1>Hola desde React!</h1>
        <p>Mensaje del backend:</p>
        <h2>{mensaje}</h2>

        <Link to="/login">
          <button className="btn-primary">Comenzar</button>
        </Link>
    </div>
  )
}
