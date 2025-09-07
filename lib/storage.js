export default class Storage {
  constructor() {
    this.isAvailable = this.checkAvailability()
  }
  
  checkAvailability() {
    try {
      const test = 'test'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (e) {
      return false
    }
  }
  
  // Best score management
  getBestScore() {
    if (!this.isAvailable) return 0
    try {
      return parseInt(localStorage.getItem('balanceBuilder.bestScore') || '0', 10)
    } catch (e) {
      return 0
    }
  }
  
  setBestScore(score) {
    if (!this.isAvailable) return
    try {
      localStorage.setItem('balanceBuilder.bestScore', score.toString())
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // Settings management
  getSettings() {
    if (!this.isAvailable) return null
    try {
      const stored = localStorage.getItem('balanceBuilder.settings')
      return stored ? JSON.parse(stored) : null
    } catch (e) {
      return null
    }
  }
  
  setSettings(settings) {
    if (!this.isAvailable) return
    try {
      localStorage.setItem('balanceBuilder.settings', JSON.stringify(settings))
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // Game statistics
  getStats() {
    if (!this.isAvailable) return null
    try {
      const stored = localStorage.getItem('balanceBuilder.stats')
      return stored ? JSON.parse(stored) : {
        gamesPlayed: 0,
        totalBlocks: 0,
        perfectPlacements: 0,
        maxCombo: 0,
        averageScore: 0
      }
    } catch (e) {
      return null
    }
  }
  
  updateStats(newStats) {
    if (!this.isAvailable) return
    try {
      const current = this.getStats() || {
        gamesPlayed: 0,
        totalBlocks: 0,
        perfectPlacements: 0,
        maxCombo: 0,
        averageScore: 0
      }
      
      const updated = { ...current, ...newStats }
      localStorage.setItem('balanceBuilder.stats', JSON.stringify(updated))
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // Daily challenge seed
  getDailySeed() {
    if (!this.isAvailable) return null
    try {
      const today = new Date().toISOString().split('T')[0]
      const stored = localStorage.getItem('balanceBuilder.dailySeed')
      const data = stored ? JSON.parse(stored) : null
      
      if (data && data.date === today) {
        return data.seed
      }
      
      // Generate new seed for today
      const newSeed = Math.floor(Math.random() * 1000000)
      this.setDailySeed(newSeed)
      return newSeed
    } catch (e) {
      return Math.floor(Math.random() * 1000000)
    }
  }
  
  setDailySeed(seed) {
    if (!this.isAvailable) return
    try {
      const today = new Date().toISOString().split('T')[0]
      localStorage.setItem('balanceBuilder.dailySeed', JSON.stringify({
        date: today,
        seed: seed
      }))
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // Clear all data
  clearAll() {
    if (!this.isAvailable) return
    try {
      const keys = [
        'balanceBuilder.bestScore',
        'balanceBuilder.settings',
        'balanceBuilder.stats',
        'balanceBuilder.dailySeed'
      ]
      
      keys.forEach(key => localStorage.removeItem(key))
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // Export data
  exportData() {
    if (!this.isAvailable) return null
    try {
      return {
        bestScore: this.getBestScore(),
        settings: this.getSettings(),
        stats: this.getStats(),
        exportDate: new Date().toISOString()
      }
    } catch (e) {
      return null
    }
  }
  
  // Import data
  importData(data) {
    if (!this.isAvailable || !data) return false
    try {
      if (data.bestScore !== undefined) {
        this.setBestScore(data.bestScore)
      }
      if (data.settings) {
        this.setSettings(data.settings)
      }
      if (data.stats) {
        this.updateStats(data.stats)
      }
      return true
    } catch (e) {
      return false
    }
  }
}