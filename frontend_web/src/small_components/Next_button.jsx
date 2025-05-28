import React from 'react';
import { Link } from 'react-router-dom';
import './NextButton.css';

export default function NextButton() {
  return (
    <div>
      <Link to="/login">
        <button className="btn-primary">Dive In</button>
      </Link>
    </div>
  );
}