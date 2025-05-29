import React from 'react'
import './HeaderLanding.css'
import { Link } from 'react-router-dom';

export const HeaderLanding = () => {
  return (
    <div className='header'>
        
            <a>M.AI</a>
            <li>
                <div className='sections'>
                    <a>Functionalities</a>
                    <a>How it works</a>
                    <a>Team</a>
                </div>
            </li>
            <Link to="/login">
            <a href='' className="loginBtn">
                Log in
                <div className="loginBtnCircle"></div>
            </a>
            </Link>
        
    </div>
  )
}
