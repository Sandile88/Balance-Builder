import { useState } from 'react'
import { useAccount } from 'wagmi'
import WalletConnect from './WalletConnect'

export default function HUD({
  gameState,
  score,
  bestScore,
  combo,
  level,
  settings,
  onStart,
  onPause,
  onRestart,
  onSettingsChange
}) {
  const { isConnected } = useAccount()
  const [showSettings, setShowSettings] = useState(false)

  const toggleSetting = (key) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    })
  }

  const isPlaying = gameState === 'playing'
  const isPaused = gameState === 'paused'
  const comboPercentage = Math.min((combo / 10) * 100, 100)

  return (
    <div className="hud-container">
      {/* Score Display */}
      <div className="hud-section score-section">
        <div className="score-display">
          <div className="current-score">
            <label>Score</label>
            <span className="score-value">{score.toLocaleString()}</span>
          </div>
          <div className="best-score">
            <label>Best</label>
            <span className="score-value">{bestScore.toLocaleString()}</span>
          </div>
        </div>
        
        {combo > 1 && (
          <div className="combo-display">
            <div className="combo-bar">
              <div 
                className="combo-fill" 
                style={{ width: `${comboPercentage}%` }}
              />
            </div>
            <span className="combo-text">Combo ×{combo}</span>
          </div>
        )}
        
        <div className="level-display">
          Level {level}
        </div>
      </div>

      {/* Game Controls */}
      <div className="hud-section controls-section">
        {/* Settings and Sound buttons */}
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className="hud-button"
          aria-label="Settings"
        >
          ⚙️
        </button>

        <button 
          onClick={() => toggleSetting('soundEnabled')} 
          className="hud-button"
          aria-label={settings.soundEnabled ? "Mute" : "Unmute"}
        >
          {settings.soundEnabled ? '🔊' : '🔇'}
        </button>
        
        {/* Game control buttons */}
        {gameState === 'menu' && (
          <button onClick={onStart} className="hud-button primary">
            Start
          </button>
        )}
        
        {isPlaying && (
          <button onClick={onPause} className="hud-button">
            Pause
          </button>
        )}
        
        {isPaused && (
          <button onClick={onPause} className="hud-button primary">
            Resume
          </button>
        )}
        
        {(isPlaying || isPaused) && (
          <button onClick={onRestart} className="hud-button secondary">
            Restart
          </button>
        )}
      </div>
      
      {/* Wallet Connect in HUD - positioned after controls */}
      {isConnected && (
        <div className="hud-section wallet-section">
          <WalletConnect />
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Settings</h3>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={() => toggleSetting('highContrast')}
            />
            <span>High Contrast</span>
          </label>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={() => toggleSetting('reducedMotion')}
            />
            <span>Reduced Motion</span>
          </label>
          
          <label className="setting-item">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={() => toggleSetting('soundEnabled')}
            />
            <span>Sound Effects</span>
          </label>
        </div>
      )}

      {/* Mobile Controls */}
      {(isPlaying || isPaused) && (
        <div className="mobile-controls">
          {/* Left Arrow */}
          <button 
            className="mobile-control-button left"
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('left', true)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('left', false)
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('left', false)
            }}
            onMouseDown={() => window.game?.handleTouch('left', true)}
            onMouseUp={() => window.game?.handleTouch('left', false)}
            onMouseLeave={() => window.game?.handleTouch('left', false)}
          >
            ←
          </button>
          
          {/* Drop Button */}
          <button 
            className="mobile-control-button drop"
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('drop', true)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('drop', false)
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('drop', false)
            }}
          >
            DROP
          </button>
          
          {/* Right Arrow */}
          <button 
            className="mobile-control-button right"
            onTouchStart={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('right', true)
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('right', false)
            }}
            onTouchCancel={(e) => {
              e.preventDefault()
              e.stopPropagation()
              window.game?.handleTouch('right', false)
            }}
            onMouseDown={() => window.game?.handleTouch('right', true)}
            onMouseUp={() => window.game?.handleTouch('right', false)}
            onMouseLeave={() => window.game?.handleTouch('right', false)}
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}