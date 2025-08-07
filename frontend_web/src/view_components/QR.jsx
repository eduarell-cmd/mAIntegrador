// src/components/QR.jsx

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa si usas React Router
import './QR.css';

// Define la URL de tu API de FastAPI.
const API_URL = "http://52.207.227.125:8000";

export default function QR() {
    const [qrData, setQrData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        let intervalId;

        const fetchQrData = async () => {
            try {
                const response = await axios.get(`${API_URL}/auth/qr/generate`);
                setSessionId(response.data.session_id);
                setQrData(response.data.qr_data);
                setIsLoading(false);
                intervalId = setInterval(checkQrStatus, 3000);
            } catch (err) {
                console.error("Error al generar el QR:", err);
                setError("No se pudo generar el código QR. Intenta de nuevo.");
                setIsLoading(false);
            }
        };

        const checkQrStatus = async () => {
            if (!sessionId) return;
            try {
                const response = await axios.get(`${API_URL}/auth/qr/status/${sessionId}`);
                
                if (response.data.status === 'authenticated') {
                    console.log("¡Login exitoso! Token recibido.");
                    
                    clearInterval(intervalId); 
                    
                    // 🚨 Modificación clave: Navegamos al componente `Mirror`
                    // y pasamos el sessionId como estado.
                    navigate('/mirror', { state: { sessionId: sessionId, token: response.data.token } });
                }
            } catch (err) {
                if (err.response && err.response.status === 410) {
                    console.error("Sesión expirada.");
                    setError("Sesión expirada. Por favor, recarga la página para obtener un nuevo QR.");
                    clearInterval(intervalId);
                } else {
                    console.error("Error durante el polling:", err);
                }
            }
        };

        fetchQrData();

        return () => {
            clearInterval(intervalId);
        };

    }, [navigate, sessionId]);

    return (
        <div className='QRView flex-center'>
            <div className="qr-container">
                {isLoading && <p>Generando código QR...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {qrData && !error && !isLoading && (
                    <>
                        <h2 className='qr-title'>Link account</h2>
                        <div className='qr-code'>
                            <QRCode value={qrData} />
                        </div>
                        <h2 className='qr-title'>by scanning the QR code</h2>
                    </>
                )}
            </div>
        </div>
    );
}