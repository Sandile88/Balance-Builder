import Link from 'next/link'

export const metadata = {
  title: 'How to Play - Balance Builder',
  description: 'Learn how to play Balance Builder and master the art of precision stacking',
}

export default function HowTo() {
  return (
    <div className="how-to-container">
      <main className="how-to-content">
        <Link href="/" className="back-link">← Back to Game</Link>
        
        <h1>How to Play Balance Builder</h1>

        <section className="instructions-section">
          <h2>🎯 Objective</h2>
          <p>Stack falling blocks onto a platform to build the tallest stable tower possible. The game ends if a block falls off the platform or your tower collapses from instability.</p>
        </section>

        <section className="instructions-section">
          <h2>🎮 Controls</h2>
          
          <div className="controls-grid">
            <div className="control-group">
              <h3>Desktop</h3>
              <ul>
                <li><kbd>←</kbd> <kbd>→</kbd> or <kbd>A</kbd> <kbd>D</kbd> - Move crane left/right</li>
                <li><kbd>Space</kbd> or <kbd>Click</kbd> - Drop block</li>
                <li><kbd>P</kbd> - Pause game</li>
                <li><kbd>R</kbd> - Restart game</li>
              </ul>
            </div>

            <div className="control-group">
              <h3>Mobile</h3>
              <ul>
                <li>Tap <strong>LEFT</strong> / <strong>RIGHT</strong> buttons to move crane</li>
                <li>Tap <strong>DROP</strong> button to release block</li>
                <li>Use on-screen pause and restart buttons</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="instructions-section">
          <h2>🏆 Scoring System</h2>
          <ul>
            <li><strong>+1 point</strong> for each successfully placed block</li>
            <li><strong>Perfect Placement Bonus:</strong> Extra points for dropping blocks near the center</li>
            <li><strong>Combo Multiplier:</strong> Consecutive perfect placements multiply your score</li>
            <li><strong>Stability Bonus:</strong> Perfect placements also make your tower more stable</li>
          </ul>
        </section>

        <section className="instructions-section">
          <h2>⚡ Game Mechanics</h2>
          <ul>
            <li><strong>Physics Simulation:</strong> Blocks fall with realistic gravity and collision</li>
            <li><strong>Tower Stability:</strong> Blocks can slip if poorly aligned</li>
            <li><strong>Progressive Difficulty:</strong> Blocks get narrower and crane speeds up over time</li>
            <li><strong>Wind Effects:</strong> Occasional gusts will nudge falling blocks</li>
            <li><strong>Wobble Physics:</strong> Towers naturally sway but stabilize over time</li>
          </ul>
        </section>

        <section className="instructions-section">
          <h2>💡 Pro Tips</h2>
          <ul>
            <li>Aim for the <strong>center</strong> of the previous block for maximum stability</li>
            <li>Build up <strong>combos</strong> with consecutive perfect placements</li>
            <li>Watch for <strong>wind indicators</strong> and adjust your timing</li>
            <li>Don't rush - <strong>precision beats speed</strong></li>
            <li>Use the <strong>pause feature</strong> to take breaks and plan your next move</li>
          </ul>
        </section>

        <section className="instructions-section">
          <h2>♿ Accessibility Features</h2>
          <ul>
            <li><strong>High Contrast Mode:</strong> Enhanced visibility for better readability</li>
            <li><strong>Reduced Motion:</strong> Disables screen shake and heavy animations</li>
            <li><strong>Keyboard Navigation:</strong> All controls accessible via keyboard</li>
            <li><strong>Color-Blind Safe:</strong> Uses accessible color combinations</li>
            <li><strong>Screen Reader Support:</strong> Proper ARIA labels and descriptions</li>
          </ul>
          <p>Toggle these options using the settings buttons in the game HUD.</p>
        </section>

        <section className="instructions-section">
          <h2>🎵 Sound & Haptics</h2>
          <ul>
            <li><strong>Sound Effects:</strong> Audio feedback for landings and interactions</li>
            <li><strong>Mobile Haptics:</strong> Vibration feedback on compatible devices</li>
            <li><strong>Mute Option:</strong> Toggle sounds on/off in the HUD</li>
          </ul>
        </section>

        <div className="start-playing">
          <Link href="/" className="start-button">Start Playing!</Link>
        </div>
      </main>
    </div>
  )
}