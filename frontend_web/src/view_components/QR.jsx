// src/components/QR.jsx

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa si usas React Router
import './QR.css';


export default function QR() {
    // Definimos el estado para el componente
    const [qrData, setQrData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        let intervalId;

        // Función para obtener los datos del QR desde el backend
        const fetchQrData = async () => {
            try {
                // Petición al endpoint de FastAPI para generar la sesión
                const response = await axios.get(`/api/auth/qr/generate`);
                setSessionId(response.data.session_id);
                setQrData(response.data.qr_data);
                setIsLoading(false);

                // Iniciamos el polling después de obtener el sessionId
                intervalId = setInterval(checkQrStatus, 3000); // Polling cada 3 segundos
            } catch (err) {
                console.error("Error al generar el QR:", err);
                setError("No se pudo generar el código QR. Intenta de nuevo.");
                setIsLoading(false);
            }
        };

        // Función para checar el estado de la sesión de QR
        const checkQrStatus = async () => {
            if (!sessionId) return; // Salir si aún no tenemos el sessionId
            
            try {
                // Petición al endpoint de FastAPI para checar el estado
                const response = await axios.get(`/api/auth/qr/status/${sessionId}`);
                
                if (response.data.status === 'authenticated') {
                    console.log("¡Login exitoso! Token:", response.data.token);
                    
                    // 1. Guardar el token en el almacenamiento local del navegador
                    localStorage.setItem('authToken', response.data.token);
                    
                    // 2. Detener el polling
                    clearInterval(intervalId); 
                    
                    // 3. Redirigir al usuario a la página principal
                    navigate('/dashboard'); // Cambia '/dashboard' a la ruta que necesites
                }
            } catch (err) {
                if (err.response && err.response.status === 410) {
                    console.error("Sesión expirada.");
                    setError("Sesión expirada. Por favor, recarga la página para obtener un nuevo QR.");
                    clearInterval(intervalId); // Detener el polling si la sesión expiró
                } else {
                    console.error("Error durante el polling:", err);
                }
            }
        };

        fetchQrData();

        // Esta es la función de limpieza de useEffect. Se ejecuta cuando el
        // componente se desmonta para evitar fugas de memoria.
        return () => {
            clearInterval(intervalId);
        };

    }, [navigate]); // El effect se ejecuta solo una vez al inicio

    return (
        <div className='QRView flex-center'>
            <div className="qr-container">
                {isLoading && <p>Generando código QR...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {qrData && !error && !isLoading && (
                    <>
                        <h2>Inicia sesión escaneando este QR</h2>
                        <div style={{ 
                        padding: '10px', 
                        border: '2px solid red', 
                        marginBottom: '15px',
                        wordBreak: 'break-all'
                    }}>
                        <strong>Dato para el QR (Depuración):</strong>
                        <code>{qrData}</code>
                    </div>
                        <QRCode value={qrData} key={qrData} />
                    </>
                )}
            </div>
        </div>
    );
}