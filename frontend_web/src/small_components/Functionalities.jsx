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
                <p className="f-mini-text">Now, you can see entirely how you are feeling.</p>
              </div>
            </div>
            <div className="elementSquare square2">
              <div className="f-icon"><img src={analysisIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Manage</h3>
                <p className="f-mini-text">Now, you can see entirely how you are feeling.</p>
              </div>
            </div>
            <div className="elementSquare square3">
              <div className="f-icon"><img src={interactIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Manage</h3>
                <p className="f-mini-text">Now, you can see entirely how you are feeling.</p>
              </div>
            </div>
            <div className="elementSquare square4">
              <div className="f-icon"><img src={trackIcon} alt="" /></div>
              <div className="f-text">
                <h3 className="f-mini-title">Manage</h3>
                <p className="f-mini-text">Now, you can see entirely how you are feeling.</p>
              </div>
            </div>
        </div>
    </div>
  )
}
