import React, { useState, useEffect } from 'react';
import './countdown.css'

export default function Countdown() {
    const [count, setCount] = useState(10);

    useEffect(() => {
        if (count <= 1) return; //return en 1s para parar

        const interval = setInterval(() => {
            setCount(prev => prev -1);
        }, 1000); //cada 1000ms segundos se va al siguiente estado 
        return () => clearInterval(interval);
    }, [count]);

  return (
    <div className='countdown-view flex-center'>
        <div className="timer-container">
            <p id="timer">{count}</p>
        </div>
    </div>
  );
}
