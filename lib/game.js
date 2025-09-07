'use client'
import Physics from './physics'
import Storage from './storage'
import { random, randomFloat, randomChoice } from './random'

export default class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.physics = new Physics()
    this.storage = new Storage()
    
    // Game state
    this.state = 'menu' // menu, playing, paused, gameover
    this.score = 0
    this.bestScore = 0
    this.combo = 0
    this.level = 1
    this.blocksPlaced = 0
    
    // Game settings
    this.settings = {
      highContrast: false,
      reducedMotion: false,
      soundEnabled: true
    }
    
    // Game entities
    this.crane = { x: 0, speed: 2, direction: 0 }
    this.currentBlock = null
    this.stack = []
    this.particles = []
    
    // Game world
    this.world = {
      gravity: 0.3,
      terminalVelocity: 8,
      windTimer: 0,
      windStrength: 0,
      platform: { y: 0, width: 0 }
    }
    
    // Input handling
    this.keys = {}
    this.touches = {}
    this.swipeStart = null
    this.isSwipeMoving = false
    
    // Animation
    this.lastTime = 0
    this.animationId = null
    this.screenShake = { x: 0, y: 0, intensity: 0 }
    
    // Event callbacks
    this.onStateChange = null
    this.onScoreUpdate = null
    this.onBestScoreUpdate = null
    this.onComboUpdate = null
    this.onLevelUpdate = null
    
    // Make game accessible globally for mobile controls
    window.game = this
    
    this.setupCanvas()
    this.setupEventListeners()
    this.loadSettings()
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = this.canvas.getBoundingClientRect()
      
      this.canvas.width = rect.width * dpr
      this.canvas.height = rect.height * dpr
      
      this.ctx.scale(dpr, dpr)
      this.canvas.style.width = rect.width + 'px'
      this.canvas.style.height = rect.height + 'px'
      
      // Update world dimensions
      this.world.width = rect.width
      this.world.height = rect.height
      this.world.platform.y = rect.height - 40
      this.world.platform.width = Math.min(300, rect.width * 0.6)
      
      // Initialize crane position
      this.crane.x = rect.width / 2
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
  
  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
      
      if (e.code === 'Space') {
        e.preventDefault()
        this.dropBlock()
      } else if (e.code === 'KeyP') {
        this.togglePause()
      } else if (e.code === 'KeyR') {
        this.restart()
      }
    })
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
    
    // Mouse events
    this.canvas.addEventListener('click', () => {
      if (this.state === 'playing') {
        this.dropBlock()
      }
    })
    
    // Touch events (handled via HUD component)
    
    // Canvas touch events for swipe controls
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault()
      const touch = e.touches[0]
      this.swipeStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
      this.isSwipeMoving = false
    }, { passive: false })
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      if (!this.swipeStart || this.state !== 'playing') return
      
      const touch = e.touches[0]
      const deltaX = touch.clientX - this.swipeStart.x
      const deltaY = Math.abs(touch.clientY - this.swipeStart.y)
      
      // Only register as swipe if horizontal movement is greater than vertical
      if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
        this.isSwipeMoving = true
        
        // Move crane based on swipe distance
        const swipeSpeed = 3
        const targetX = this.crane.x + (deltaX * swipeSpeed)
        this.crane.x = Math.max(50, Math.min(this.world.width - 50, targetX))
        
        // Update swipe start for continuous movement
        this.swipeStart.x = touch.clientX
      }
    }, { passive: false })
    
    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault()
      
      // If it wasn't a swipe movement, treat as tap to drop
      if (!this.isSwipeMoving && this.swipeStart && this.state === 'playing') {
        const timeDiff = Date.now() - this.swipeStart.time
        if (timeDiff < 300) { // Quick tap
          this.dropBlock()
        }
      }
      
      this.swipeStart = null
      this.isSwipeMoving = false
    }, { passive: false })
    
    this.canvas.addEventListener('touchcancel', (e) => {
      e.preventDefault()
      this.swipeStart = null
      this.isSwipeMoving = false
    }, { passive: false })
  }
  
  handleTouch(action, pressed) {
    this.touches[action] = pressed
    
    if (action === 'drop' && pressed && this.state === 'playing') {
      this.dropBlock()
    }
  }
  
  // Force pause the game
  forcePause() {
    if (this.state === 'playing') {
      this.state = 'paused'
      this.onStateChange?.('paused')
    }
  }
  
  // Force resume the game
  forceResume() {
    if (this.state === 'paused') {
      this.state = 'playing'
      this.onStateChange?.('playing')
    }
  }
  
  start() {
    this.loop(performance.now())
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.game = null
  }
  
  loop(currentTime) {
    const deltaTime = Math.min(currentTime - this.lastTime, 16.67) // Cap at 60fps
    this.lastTime = currentTime
    
    this.update(deltaTime)
    this.render()
    
    this.animationId = requestAnimationFrame((time) => this.loop(time))
  }
  
  update(deltaTime) {
    if (this.state !== 'playing') return
    
    // Update input
    this.updateInput(deltaTime)
    
    // Update physics
    this.updatePhysics(deltaTime)
    
    // Update game logic
    this.updateGameLogic(deltaTime)
    
    // Update effects
    this.updateEffects(deltaTime)
    
    // Update level progression
    this.updateLevel()
  }
  
  updateInput(deltaTime) {
    let moveDirection = 0
    
    // Desktop input
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) moveDirection -= 1
    if (this.keys['ArrowRight'] || this.keys['KeyD']) moveDirection += 1
    
    // Mobile input
    if (this.touches.left) moveDirection -= 1
    if (this.touches.right) moveDirection += 1
    
    // Update crane movement
    this.crane.direction = moveDirection
    const craneSpeed = this.crane.speed + (this.level - 1) * 0.5
    this.crane.x += moveDirection * craneSpeed * deltaTime / 16.67
    this.crane.x = Math.max(50, Math.min(this.world.width - 50, this.crane.x))
  }
  
  updatePhysics(deltaTime) {
    // Update falling block
    if (this.currentBlock && this.currentBlock.state === 'falling') {
      // Apply gravity
      this.currentBlock.vy += this.world.gravity
      this.currentBlock.vy = Math.min(this.currentBlock.vy, this.world.terminalVelocity)
      
      // Apply wind effect
      if (this.world.windStrength > 0) {
        this.currentBlock.vx += this.world.windStrength * 0.1
      }
      
      // Update position
      this.currentBlock.x += this.currentBlock.vx * deltaTime / 16.67
      this.currentBlock.y += this.currentBlock.vy * deltaTime / 16.67
      
      // Check for collisions
      this.checkCollisions()
      
      // Check if block was removed during collision check
      if (!this.currentBlock) return
      
      // Check if block fell off screen
      if (this.currentBlock.y > this.world.height + 100) {
        this.gameOver()
      }
    }
    
    // Update wind
    this.updateWind(deltaTime)
    
    // Update stack wobble
    this.updateStackWobble(deltaTime)
  }
  
  updateGameLogic(deltaTime) {
    // Spawn new block if needed
    if (!this.currentBlock) {
      this.spawnBlock()
    }
  }
  
  updateEffects(deltaTime) {
    // Update screen shake
    if (this.screenShake.intensity > 0) {
      this.screenShake.intensity *= 0.9
      if (this.screenShake.intensity < 0.1) {
        this.screenShake.intensity = 0
        this.screenShake.x = 0
        this.screenShake.y = 0
      } else {
        this.screenShake.x = (Math.random() - 0.5) * this.screenShake.intensity
        this.screenShake.y = (Math.random() - 0.5) * this.screenShake.intensity
      }
    }
    
    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx * deltaTime / 16.67
      particle.y += particle.vy * deltaTime / 16.67
      particle.life -= deltaTime / 1000
      particle.alpha = Math.max(0, particle.life / particle.maxLife)
      return particle.life > 0
    })
  }
  
  updateWind(deltaTime) {
    this.world.windTimer -= deltaTime
    
    if (this.world.windTimer <= 0 && Math.random() < 0.001 * this.level) {
      // Trigger wind gust
      this.world.windStrength = randomFloat(-2, 2) * this.level * 0.5
      this.world.windTimer = randomFloat(2000, 4000)
      
      // Add visual indicator (particles)
      this.addWindParticles()
    }
    
    if (this.world.windTimer <= 0) {
      this.world.windStrength *= 0.95
      if (Math.abs(this.world.windStrength) < 0.1) {
        this.world.windStrength = 0
      }
    }
  }
  
  updateStackWobble(deltaTime) {
    this.stack.forEach((block, index) => {
      if (block.tilt !== 0) {
        // Apply damping to wobble
        block.tilt *= 0.95
        if (Math.abs(block.tilt) < 0.001) {
          block.tilt = 0
        }
      }
    })
  }
  
  updateLevel() {
    const newLevel = Math.floor(this.blocksPlaced / 10) + 1
    if (newLevel > this.level) {
      this.level = newLevel
      this.onLevelUpdate?.(this.level)
    }
  }
  
  checkCollisions() {
    const block = this.currentBlock
    if (!block || block.state !== 'falling') return
    
    // Check collision with platform
    const platformY = this.world.platform.y
    const platformCenterX = this.world.width / 2
    const platformWidth = this.world.platform.width
    
    let collisionTarget = null
    let collisionY = platformY
    
    // Check if there are blocks in the stack
    if (this.stack.length > 0) {
      const topBlock = this.stack[this.stack.length - 1]
      collisionTarget = topBlock
      collisionY = topBlock.y
    }
    
    // Check if block is landing
    if (block.y + block.h >= collisionY) {
      // Check if block is within bounds
      let validLanding = false
      
      if (collisionTarget) {
        // Landing on another block
        const overlap = this.physics.checkOverlap(block, collisionTarget)
        if (overlap > block.w * 0.2) { // Need at least 20% overlap
          validLanding = true
        }
      } else {
        // Landing on platform
        const blockLeft = block.x - block.w / 2
        const blockRight = block.x + block.w / 2
        const platformLeft = platformCenterX - platformWidth / 2
        const platformRight = platformCenterX + platformWidth / 2
        
        if (blockRight > platformLeft && blockLeft < platformRight) {
          validLanding = true
        }
      }
      
      if (validLanding) {
        this.landBlock()
      } else {
        this.gameOver()
      }
    }
  }
  
  landBlock() {
    const block = this.currentBlock
    if (!block) return
    
    // Calculate landing position
    let landingY = this.world.platform.y - block.h
    if (this.stack.length > 0) {
      const topBlock = this.stack[this.stack.length - 1]
      landingY = topBlock.y - block.h
    }
    
    // Snap block to landing position
    block.y = landingY
    block.state = 'landed'
    block.vy = 0
    block.vx = 0
    block.tilt = 0
    
    // Add to stack
    this.stack.push(block)
    this.currentBlock = null
    this.blocksPlaced++
    
    // Calculate score
    this.calculateScore(block)
    
    // Add landing effects
    this.addLandingEffects(block)
    
    // Play sound
    this.playSound('land')
    
    // Add haptic feedback on mobile
    this.vibrate(50)
    
    // Check stability
    if (!this.checkStability()) {
      this.gameOver()
    }
  }
  
  calculateScore(block) {
    let points = 1
    let isPerfect = false
    
    // Check for perfect placement
    if (this.stack.length > 1) {
      const previousBlock = this.stack[this.stack.length - 2]
      const centerDistance = Math.abs(block.x - previousBlock.x)
      const perfectThreshold = 10
      
      if (centerDistance <= perfectThreshold) {
        isPerfect = true
        this.combo++
        points += Math.floor(perfectThreshold - centerDistance) * this.combo
        
        // Stabilize tower slightly
        this.stabilizeTower()
      } else {
        this.combo = 0
      }
    }
    
    this.score += points
    this.onScoreUpdate?.(this.score)
    this.onComboUpdate?.(this.combo)
    
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      this.storage.setBestScore(this.bestScore)
      this.onBestScoreUpdate?.(this.bestScore)
    }
  }
  
  checkStability() {
    if (this.stack.length < 2) return true
    
    // Check if tower is too unstable
    let totalOffset = 0
    for (let i = 1; i < this.stack.length; i++) {
      const current = this.stack[i]
      const previous = this.stack[i - 1]
      totalOffset += Math.abs(current.x - previous.x)
    }
    
    const maxOffset = this.stack.length * 15 + this.level * 5
    return totalOffset <= maxOffset
  }
  
  stabilizeTower() {
    // Reduce wobble slightly for perfect placements
    this.stack.forEach(block => {
      block.tilt *= 0.8
    })
  }
  
  spawnBlock() {
    const minWidth = Math.max(30, 80 - this.level * 2)
    const maxWidth = Math.max(minWidth, 100 - this.level)
    const width = randomFloat(minWidth, maxWidth)
    const height = 20
    
    this.currentBlock = {
      x: this.crane.x,
      y: -height,
      w: width,
      h: height,
      vx: randomFloat(-0.5, 0.5),
      vy: 0,
      state: 'falling',
      tilt: 0,
      color: randomChoice(['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'])
    }
  }
  
  dropBlock() {
    if (this.state !== 'playing' || !this.currentBlock) return
    
    // Release block from crane
    if (this.currentBlock.state === 'hanging') {
      this.currentBlock.state = 'falling'
      this.currentBlock.vx += randomFloat(-1, 1) * 0.5
    }
  }
  
  addLandingEffects(block) {
    if (this.settings.reducedMotion) return
    
    // Screen shake
    this.screenShake.intensity = 5
    
    // Particles
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: block.x + randomFloat(-block.w/2, block.w/2),
        y: block.y,
        vx: randomFloat(-2, 2),
        vy: randomFloat(-3, -1),
        life: randomFloat(0.3, 0.8),
        maxLife: 0.8,
        alpha: 1,
        size: randomFloat(2, 4),
        color: '#FFF'
      })
    }
  }
  
  addWindParticles() {
    const direction = this.world.windStrength > 0 ? 1 : -1
    
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: randomFloat(0, this.world.width),
        y: randomFloat(0, this.world.height * 0.7),
        vx: direction * randomFloat(2, 4),
        vy: randomFloat(-0.5, 0.5),
        life: randomFloat(1, 2),
        maxLife: 2,
        alpha: 1,
        size: 2,
        color: '#87CEEB'
      })
    }
  }
  
  render() {
    const ctx = this.ctx
    
    // Clear canvas
    ctx.clearRect(0, 0, this.world.width, this.world.height)
    
    // Apply screen shake
    if (!this.settings.reducedMotion && this.screenShake.intensity > 0) {
      ctx.save()
      ctx.translate(this.screenShake.x, this.screenShake.y)
    }
    
    // Render background
    this.renderBackground()
    
    // Render platform
    this.renderPlatform()
    
    // Render stack
    this.renderStack()
    
    // Render current block
    if (this.currentBlock) {
      this.renderBlock(this.currentBlock)
    }
    
    // Render crane
    this.renderCrane()
    
    // Render particles
    this.renderParticles()
    
    // Render wind indicator
    if (Math.abs(this.world.windStrength) > 0.1) {
      this.renderWindIndicator()
    }
    
    // Restore transform
    if (!this.settings.reducedMotion && this.screenShake.intensity > 0) {
      ctx.restore()
    }
  }
  
  renderBackground() {
    const ctx = this.ctx
    const gradient = ctx.createLinearGradient(0, 0, 0, this.world.height)
    
    if (this.settings.highContrast) {
      gradient.addColorStop(0, '#000000')
      gradient.addColorStop(1, '#222222')
    } else {
      gradient.addColorStop(0, '#87CEEB')
      gradient.addColorStop(1, '#E0F6FF')
    }
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, this.world.width, this.world.height)
  }
  
  renderPlatform() {
    const ctx = this.ctx
    const platformY = this.world.platform.y
    const platformCenterX = this.world.width / 2
    const platformWidth = this.world.platform.width
    
    // Platform shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(platformCenterX - platformWidth/2 + 2, platformY + 2, platformWidth, 40)
    
    // Platform
    ctx.fillStyle = this.settings.highContrast ? '#FFFFFF' : '#8B4513'
    ctx.fillRect(platformCenterX - platformWidth/2, platformY, platformWidth, 40)
    
    // Platform highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(platformCenterX - platformWidth/2, platformY, platformWidth, 4)
  }
  
  renderStack() {
    this.stack.forEach((block, index) => {
      this.renderBlock(block, index)
    })
  }
  
  renderBlock(block, index = -1) {
    const ctx = this.ctx
    
    ctx.save()
    ctx.translate(block.x, block.y + block.h/2)
    ctx.rotate(block.tilt || 0)
    
    // Block shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillRect(-block.w/2 + 1, -block.h/2 + 1, block.w, block.h)
    
    // Block
    ctx.fillStyle = block.color || (this.settings.highContrast ? '#FFFFFF' : '#3B82F6')
    ctx.fillRect(-block.w/2, -block.h/2, block.w, block.h)
    
    // Block highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillRect(-block.w/2, -block.h/2, block.w, 3)
    
    // Block border
    ctx.strokeStyle = this.settings.highContrast ? '#000000' : 'rgba(0, 0, 0, 0.2)'
    ctx.lineWidth = 1
    ctx.strokeRect(-block.w/2, -block.h/2, block.w, block.h)
    
    ctx.restore()
  }
  
  renderCrane() {
    const ctx = this.ctx
    const craneX = this.crane.x
    const craneY = 20
    
    // Crane arm
    ctx.strokeStyle = this.settings.highContrast ? '#FFFFFF' : '#666666'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, craneY)
    ctx.lineTo(this.world.width, craneY)
    ctx.stroke()
    
    // Crane hook
    ctx.fillStyle = this.settings.highContrast ? '#FFFFFF' : '#FFD700'
    ctx.fillRect(craneX - 3, craneY, 6, 20)
    
    // Crane base
    ctx.fillStyle = this.settings.highContrast ? '#FFFFFF' : '#666666'
    ctx.fillRect(craneX - 8, craneY - 5, 16, 8)
  }
  
  renderParticles() {
    const ctx = this.ctx
    
    this.particles.forEach(particle => {
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color
      ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size)
      ctx.restore()
    })
  }
  
  renderWindIndicator() {
    if (this.settings.reducedMotion) return
    
    const ctx = this.ctx
    const intensity = Math.abs(this.world.windStrength)
    const direction = this.world.windStrength > 0 ? 1 : -1
    const x = direction > 0 ? this.world.width - 60 : 60
    const y = 60
    
    ctx.save()
    ctx.globalAlpha = Math.min(intensity * 0.5, 1)
    ctx.fillStyle = '#87CEEB'
    ctx.font = '20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('💨', x, y)
    ctx.restore()
  }
  
  startGame() {
    this.state = 'playing'
    this.score = 0
    this.combo = 0
    this.level = 1
    this.blocksPlaced = 0
    this.crane.x = this.world.width / 2
    this.currentBlock = null
    this.stack = []
    this.particles = []
    this.world.windStrength = 0
    this.world.windTimer = 0
    
    this.onStateChange?.('playing')
    this.onScoreUpdate?.(0)
    this.onComboUpdate?.(0)
    this.onLevelUpdate?.(1)
  }
  
  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused'
      this.onStateChange?.('paused')
    } else if (this.state === 'paused') {
      this.state = 'playing'
      this.onStateChange?.('playing')
    }
  }
  
  restart() {
    this.startGame()
  }
  
  gameOver() {
    this.state = 'gameover'
    this.onStateChange?.('gameover')
    
    // Save best score
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      this.storage.setBestScore(this.bestScore)
      this.onBestScoreUpdate?.(this.bestScore)
    }
    
    // Play game over sound
    this.playSound('gameover')
    
    // Strong haptic feedback
    this.vibrate([100, 50, 100])
  }
  
  loadSettings() {
    const saved = this.storage.getSettings()
    if (saved) {
      this.settings = { ...this.settings, ...saved }
    }
    this.bestScore = this.storage.getBestScore()
  }
  
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    this.storage.setSettings(this.settings)
  }
  
  getBestScore() {
    return this.storage.getBestScore()
  }
  
  playSound(type) {
    if (!this.settings.soundEnabled) return
    
    // Simple sound implementation using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      let frequency = 440
      let duration = 0.1
      
      switch (type) {
        case 'land':
          frequency = 220
          duration = 0.15
          break
        case 'perfect':
          frequency = 880
          duration = 0.2
          break
        case 'gameover':
          frequency = 110
          duration = 0.5
          break
      }
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start()
      oscillator.stop(audioContext.currentTime + duration)
    } catch (e) {
      // Ignore audio errors
    }
  }
  
  vibrate(pattern) {
    if (navigator.vibrate && !this.settings.reducedMotion) {
      navigator.vibrate(pattern)
    }
  }
}