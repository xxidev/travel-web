import React from 'react'
import './Header.css'

const Header: React.FC = () => {
  return (
    <header>
      <h1>智能旅行规划助手</h1>
      <p className="subtitle">告诉我你的目的地、时间和预算，我为你规划完美行程</p>
    </header>
  )
}

export default Header
