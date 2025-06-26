import React from 'react';
import './Functionalities.css';
import manageIcon from '../assets/icons/manage.png';
import analysisIcon from '../assets/icons/data-analysis.png';
import interactIcon from '../assets/icons/touch.png';
import trackIcon from '../assets/icons/scanner.png'

export const Functionalities = () => {
  return (
    <div className='fun-grid'>
        <h1 className='title funTitle interactive'>Functionalities</h1>
        <div className="gridFourElements">
            <div className="elementSquare square1">
              <div className="f-icon"><img src={manageIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Manage</h3>
                <p className="f-mini-text">Now, you can see <span className='f-s-red'>entirely</span> how you are feeling.</p>
              </div>
            </div>
            <div className="elementSquare square2">
              <div className="f-icon"><img src={analysisIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Analyse</h3>
                <p className="f-mini-text">Analyse your emotions. Then, take a step to <span className='f-s-blue'>improve</span> your state!</p>
              </div>
            </div>
            <div className="elementSquare square3">
              <div className="f-icon"><img src={interactIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Interaction</h3>
                <p className="f-mini-text">Control the <span className='f-s-blue'>interface</span> by your app or by just waving your hands!</p>
              </div>
            </div>
            <div className="elementSquare square4">
              <div className="f-icon"><img src={trackIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Tracking</h3>
                <p className="f-mini-text">Hand, face and emotion tracking in real time. <span className="f-s-red">Consult</span> them in your app!</p>
              </div>
            </div>
        </div>
    </div>
  )
}
