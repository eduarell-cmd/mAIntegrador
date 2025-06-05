import './Worries.css'
import phonesImg from '../assets/images/final-mobiles-landing.png'

import React from 'react'

export const Worries = () => {
  return (
    <div className='WorriesSection'>
        <div className="phones interactive title">
            <img src={phonesImg} alt="PhonesM.AI" />
        </div>
        <div className="c-titles">
            <h1 className='title interactive'><span>Don't Worry</span></h1>
            <h1 className='title interactive'>Your emotions <br /> are one tap <br />away from you!</h1>
        </div>

    </div>
  )
}
