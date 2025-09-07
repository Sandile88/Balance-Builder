// Seeded random number generator for consistent results
class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed
    this.current = seed
  }
  
  // Linear congruential generator
  next() {
    this.current = (this.current * 1664525 + 1013904223) % 4294967296
    return this.current / 4294967296
  }
  
  // Random integer between min (inclusive) and max (inclusive)
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
  
  // Random float between min and max
  float(min, max) {
    return this.next() * (max - min) + min
  }
  
  // Random choice from array
  choice(array) {
    return array[this.int(0, array.length - 1)]
  }
  
  // Random boolean with probability (0-1)
  boolean(probability = 0.5) {
    return this.next() < probability
  }
  
  // Reset to original seed
  reset() {
    this.current = this.seed
  }
  
  // Set new seed
  setSeed(seed) {
    this.seed = seed
    this.current = seed
  }
}

// Default instance for convenience
const defaultRandom = new SeededRandom()

// Convenience functions using default instance
export function random() {
  return Math.random()
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function randomBoolean(probability = 0.5) {
  return Math.random() < probability
}

// Seeded versions
export function seededRandom(seed) {
  return new SeededRandom(seed)
}

export function seededInt(seed, min, max) {
  const rng = new SeededRandom(seed)
  return rng.int(min, max)
}

export function seededFloat(seed, min, max) {
  const rng = new SeededRandom(seed)
  return rng.float(min, max)
}

export function seededChoice(seed, array) {
  const rng = new SeededRandom(seed)
  return rng.choice(array)
}

// Gaussian/normal distribution random
export function randomGaussian(mean = 0, stdDev = 1) {
  // Box-Muller transform
  let u = 0, v = 0
  while(u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random()
  
  const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  return z * stdDev + mean
}

// Weighted random choice
export function weightedChoice(items, weights) {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length')
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let randomWeight = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    randomWeight -= weights[i]
    if (randomWeight <= 0) {
      return items[i]
    }
  }
  
  // Fallback to last item
  return items[items.length - 1]
}

// Shuffle array using Fisher-Yates algorithm
export function shuffle(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate random hex color
export function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

// Generate random RGB color
export function randomRGB() {
  return {
    r: randomInt(0, 255),
    g: randomInt(0, 255),
    b: randomInt(0, 255)
  }
}

// Generate random HSL color
export function randomHSL() {
  return {
    h: randomInt(0, 360),
    s: randomInt(0, 100),
    l: randomInt(0, 100)
  }
}

// Random point in circle
export function randomPointInCircle(centerX, centerY, radius) {
  const angle = Math.random() * 2 * Math.PI
  const r = Math.random() * radius
  return {
    x: centerX + r * Math.cos(angle),
    y: centerY + r * Math.sin(angle)
  }
}

// Random point in rectangle
export function randomPointInRect(x, y, width, height) {
  return {
    x: x + Math.random() * width,
    y: y + Math.random() * height
  }
}

export { SeededRandom }
export default defaultRandom