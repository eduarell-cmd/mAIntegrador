import React from 'react'
import './HeaderLanding.css'

export const HeaderLanding = () => {
  return (
    <div className='header'>
        <ul>
            <a>m.ai</a>
            <li>
                <div className='sections'>
                    <a>Functionalities</a>
                    <a>How it works</a>
                    <a>Team</a>
                </div>
            </li>
            <a href='' className="loginBtn">
                Log in
                <div className="loginBtnCircle"></div>
            </a>
        </ul>
    </div>
  )
}
