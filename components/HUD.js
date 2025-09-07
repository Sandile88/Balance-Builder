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
  const [showPauseModal, setShowPauseModal] = useState(false)

  const toggleSetting = (key) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    })
  }

  const handleHamburgerClick = () => {
    if (gameState === 'playing') {
      onPause() // Pause the game
    }
    setShowPauseModal(true)
  }

  const handleResumeGame = () => {
    setShowPauseModal(false)
    if (gameState === 'paused') {
      onPause() // Resume the game
    }
  }

  const handleRestartFromModal = () => {
    setShowPauseModal(false)
    onRestart()
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

      {/* Desktop Controls */}
      <div className="hud-section controls-section desktop-only">
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

        {isConnected && (
          <div className="wallet-connect-desktop">
            <WalletConnect />
          </div>
        )}
      </div>

      {/* Mobile Hamburger Menu */}
      <div className="hud-section mobile-menu-section mobile-only">
        <button 
          onClick={handleHamburgerClick}
          className="hamburger-button"
          aria-label="Menu"
        >
          <div className="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="pause-modal-overlay" onClick={() => setShowPauseModal(false)}>
          <div className="pause-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pause-modal-header">
              <h3>Game Paused</h3>
              <button 
                onClick={() => setShowPauseModal(false)}
                className="close-menu-button"
              >
                ✕
              </button>
            </div>
            
            <div className="pause-modal-items">
              {/* Game Controls */}
              <div className="menu-section">
                <h4>Game Controls</h4>
                
                {(isPlaying || isPaused) && (
                  <button onClick={handleResumeGame} className="menu-item-button primary">
                    ▶️ Resume Game
                  </button>
                )}
                
                {(isPlaying || isPaused) && (
                  <button onClick={handleRestartFromModal} className="menu-item-button secondary">
                    🔄 Restart Game
                  </button>
                )}

                {gameState === 'menu' && (
                  <button onClick={() => { onStart(); setShowPauseModal(false); }} className="menu-item-button primary">
                    🎮 Start Game
                  </button>
                )}
              </div>

              {/* Settings */}
              <div className="menu-section">
                <h4>Settings</h4>
                
                <label className="menu-setting-item">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={() => toggleSetting('soundEnabled')}
                  />
                  <span>🔊 Sound Effects</span>
                </label>
                
                <label className="menu-setting-item">
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={() => toggleSetting('highContrast')}
                  />
                  <span>🎨 High Contrast</span>
                </label>
                
                <label className="menu-setting-item">
                  <input
                    type="checkbox"
                    checked={settings.reducedMotion}
                    onChange={() => toggleSetting('reducedMotion')}
                  />
                  <span>🎭 Reduced Motion</span>
                </label>
              </div>

              {/* Wallet */}
              {isConnected && (
                <div className="menu-section">
                  <h4>Wallet</h4>
                  <div className="wallet-connect-modal">
                    <WalletConnect />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Settings Panel */}
      {showSettings && (
        <div className="settings-panel desktop-only">
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

      {/* Mobile Controls - Only Drop Button and Swipe Instructions */}
      {(isPlaying || isPaused) && (
        <div className="mobile-controls">
          <div className="swipe-instructions">
            <span>👈 Swipe to move crane 👉</span>
          </div>
          
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
        </div>
      )}
    </div>
  )
}