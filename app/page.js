'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAccount } from 'wagmi'
import Game from '../lib/game'
import HUD from '../components/HUD'
import WalletConnect from '../components/WalletConnect'
import { useMiniKit } from '@coinbase/onchainkit/minikit'

export default function Home() {
  const { isConnected } = useAccount()
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const [gameState, setGameState] = useState('menu')
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [level, setLevel] = useState(1)
  const [settings, setSettings] = useState({
    highContrast: false,
    reducedMotion: false,
    soundEnabled: true
  })

  // ✅ MiniKit setup
  const { setFrameReady, isFrameReady } = useMiniKit()
  useEffect(() => {
    if (!isFrameReady) setFrameReady()
  }, [isFrameReady, setFrameReady])


  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Initialize game
    const game = new Game(canvas)
    gameRef.current = game

    // Set up event listeners
    game.onStateChange = setGameState
    game.onScoreUpdate = setScore
    game.onBestScoreUpdate = setBestScore
    game.onComboUpdate = setCombo
    game.onLevelUpdate = setLevel

    // Load settings and best score
    game.loadSettings()
    const savedBestScore = game.getBestScore()
    setBestScore(savedBestScore)

    // Start the game loop
    game.start()

    return () => {
      game.destroy()
    }
  }, [])

  const handleStart = () => {
    gameRef.current?.startGame()
  }

  const handlePause = () => {
    gameRef.current?.togglePause()
  }

  const handleRestart = () => {
    gameRef.current?.restart()
  }

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings)
    gameRef.current?.updateSettings(newSettings)
  }

  return (
    <main className={`game-container ${settings.highContrast ? 'high-contrast' : ''} ${settings.reducedMotion ? 'reduced-motion' : ''}`}>
      <canvas
        ref={canvasRef}
        className="game-canvas"
        tabIndex={0}
        aria-label="Balance Builder Game Canvas"
      />

      <HUD
        gameState={gameState}
        score={score}
        bestScore={bestScore}
        combo={combo}
        level={level}
        settings={settings}
        onStart={handleStart}
        onPause={handlePause}
        onRestart={handleRestart}
        onSettingsChange={handleSettingsChange}
      />

      {gameState === 'menu' && (
        <div className="menu-overlay">
          <div className="menu-content">
            <h1 className="game-title">Balance Builder</h1>
            <p className="game-subtitle">Stack blocks with precision to build the tallest tower!</p>
            
            {!isConnected ? (
              <div className="wallet-connect-section">
                <p className="connect-message">Connect your wallet to start playing</p>
                <WalletConnect fullWidth={true} size="lg" />
              </div>
            ) : (
              <div className="game-actions">
                <button onClick={handleStart} className="start-button">
                  Start Game
                </button>
                <Link href="/how-to" className="how-to-link">
                  How to Play
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="menu-overlay">
          <div className="menu-content">
            <h2 className="game-over-title">Tower Collapsed!</h2>
            <div className="final-score">
              <p>Final Score: <span className="score-value">{score}</span></p>
              {score === bestScore && bestScore > 0 && (
                <p className="new-best">🎉 New Best Score!</p>
              )}
            </div>
            {isConnected && (
              <div className="game-actions">
                <button onClick={handleRestart} className="start-button">
                  Try Again
                </button>
                <Link href="/how-to" className="how-to-link">
                  How to Play
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className="game-footer">
        <Link href="/how-to">Controls & Tips</Link>
      </footer>
    </main>
  )
}