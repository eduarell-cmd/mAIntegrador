import React from 'react'
import './Confused.css'
import mirrorImage from '../assets/images/light-magic-mirror-transparente.png';

export const Confused = () => {
  return (
    <section className='confused-section'>
        <div className="c-titles">
            <h1 className='title interactive'><span>Confused?</span></h1>
            <h1 className='title interactive'>
                Explore your <br />
                emotions <br />
                from the <br />
                inside out.
            </h1>
        </div>
        <div className="img-mirror title interactive"><img src={mirrorImage} alt="mirror" /></div>
    </section>
  )
}
