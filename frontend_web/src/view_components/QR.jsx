import React from 'react'
import './QR.css';
// import QRImg from '../assets/images/curiouscat.jpg';
import QRImg from '../assets/images/qrcodetest.png';

export default function QR () {
  return (
    <div className='QRView flex-center'>
        <div className="qr-container">
            <img src={QRImg} alt="gato" />
        </div>
    </div>
  )
}
