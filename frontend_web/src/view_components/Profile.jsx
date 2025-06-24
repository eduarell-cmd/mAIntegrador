import React from 'react'
import './Profile.css'
import { CirclesBackground } from '../small_components/CirclesBackground';
import settingsIcon from '../assets/icons/settings.png';
import PAvatar from '../assets/images/avatar2.png';
import DownArrow from '../assets/icons/downArrow.png';
import Happy from '../assets/images/happy.png';
import Sad from '../assets/images/sad-face.png';
import Neutral from '../assets/images/neutral.png';
import Fear from '../assets/images/fear.png';
import Surprised from '../assets/images/surprised.png';
import Angry from '../assets/images/angry.png';


export default function Profile() {
  return (
    <div className='ProfileView'>
        <CirclesBackground />
        <div className="left-p-section">
            <div className='user-info'>
              <div className="p-img flex-center"><img src={PAvatar} alt="avatar" /></div>
              <div className="p-info">
                <h1>Angel Diaz Dittrich</h1>
                <h3>22 years old</h3>
              </div>
              <div className="p-settings flex-center"><img src={settingsIcon} alt="" /></div>
            </div>
            <div className='user-tip'>
              <div className="emotion-container interactive">
                  <img src={ Happy } alt="emotion" />
              </div>
              <div className="v-line"></div>
              <div className="tip-text-zone">
                <h2>You look happy!</h2>
                <p>You should write about why you are feeling well.</p>
              </div>
              <div className="arrows-container flex-center">
                <img src={DownArrow} className='up-arrow' alt="up" />
                <img src={DownArrow} className='down-arrow' alt="down" />
              </div>
            </div>
            <div className='user-weekly'>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Fear } alt="emotion" />
                </div>
                <h3>Mon</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Happy } alt="emotion" />
                </div>
                <h3>Tue</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Angry } alt="emotion" />
                </div>
                <h3>Wed</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Surprised } alt="emotion" />
                </div>
                <h3>Thu</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Sad } alt="emotion" />
                </div>
                <h3>Fri</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Happy } alt="emotion" />
                </div>
                <h3>Sat</h3>
              </div>
              <div className="weekly-emotion">
                <div className="emotion-container">
                  <img src={ Happy } alt="emotion" />
                </div>
                <h3>Sun</h3>
              </div>
            </div>
        </div>
        <div className="right-p-section">
            <div className="tracking-section">
                <div className="monthly-record">
                  <>Tracking record</>
                  <div className="flex-center K">
                    <p>M</p>
                    <p>T</p>
                    <p>W</p>
                    <p>T</p>
                    <p>F</p>
                    <p>S</p>
                    <p>S</p>
                  </div>
                  <div className="h-line"></div>
                  <div className="every-day">
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle empty-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                    <div className="day-circle active-circle-day"></div>
                  </div>
                  <div className="h-line"></div>
                  <div className="tracked-empty">
                    <div className="active-circle-day"></div>
                    <p>Tracked</p>
                    <div className="empty-circle-day"></div>
                    <p>Empty</p>
                  </div>
                </div>
                <div className="user-emotion">
                  <h2>Happy</h2>
                  <div className="emotion-container interactive">
                    <img src={ Happy } alt="emotion" />
                  </div>
                  <p>Today you seemed really happy!</p>
                </div>
            </div>
            <div className="daily-emotions"></div>
        </div>
    </div>
  )
}
