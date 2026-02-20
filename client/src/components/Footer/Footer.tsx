import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <p className="footer-text">Powered by Claude AI & Google Places</p>
          <p className="footer-copy">&copy; {new Date().getFullYear()} Voyager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
