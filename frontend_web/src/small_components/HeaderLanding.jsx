import React from 'react'
import './HeaderLanding.css'
import { Link } from 'react-router-dom';

export const HeaderLanding = () => {
  return (
    <div className='header'>
        
            <a href='#1'>M.AI</a>
            <li>
                <div className='sections'>
                    <a href='#2'>Functionalities</a>
                    <a href='#3'>How it works</a>
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
