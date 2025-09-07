export default class Physics {
  constructor() {
    this.gravity = 0.3
    this.friction = 0.98
    this.bounceDamping = 0.7
  }
  
  // Check if two rectangular objects overlap
  checkOverlap(rect1, rect2) {
    const left1 = rect1.x - rect1.w / 2
    const right1 = rect1.x + rect1.w / 2
    const top1 = rect1.y
    const bottom1 = rect1.y + rect1.h
    
    const left2 = rect2.x - rect2.w / 2
    const right2 = rect2.x + rect2.w / 2
    const top2 = rect2.y
    const bottom2 = rect2.y + rect2.h
    
    // Calculate overlap width
    const overlapLeft = Math.max(left1, left2)
    const overlapRight = Math.min(right1, right2)
    const overlapWidth = Math.max(0, overlapRight - overlapLeft)
    
    // Check if there's vertical overlap too
    const overlapTop = Math.max(top1, top2)
    const overlapBottom = Math.min(bottom1, bottom2)
    const overlapHeight = Math.max(0, overlapBottom - overlapTop)
    
    return overlapHeight > 0 ? overlapWidth : 0
  }
  
  // Check if two rectangles are colliding
  isColliding(rect1, rect2) {
    const left1 = rect1.x - rect1.w / 2
    const right1 = rect1.x + rect1.w / 2
    const top1 = rect1.y
    const bottom1 = rect1.y + rect1.h
    
    const left2 = rect2.x - rect2.w / 2
    const right2 = rect2.x + rect2.w / 2
    const top2 = rect2.y
    const bottom2 = rect2.y + rect2.h
    
    return !(left1 >= right2 || right1 <= left2 || top1 >= bottom2 || bottom1 <= top2)
  }
  
  // Resolve collision between two objects
  resolveCollision(obj1, obj2) {
    if (!this.isColliding(obj1, obj2)) return
    
    // Calculate overlap
    const left1 = obj1.x - obj1.w / 2
    const right1 = obj1.x + obj1.w / 2
    const top1 = obj1.y
    const bottom1 = obj1.y + obj1.h
    
    const left2 = obj2.x - obj2.w / 2
    const right2 = obj2.x + obj2.w / 2
    const top2 = obj2.y
    const bottom2 = obj2.y + obj2.h
    
    // Calculate overlaps
    const overlapX = Math.min(right1 - left2, right2 - left1)
    const overlapY = Math.min(bottom1 - top2, bottom2 - top1)
    
    // Resolve based on smallest overlap
    if (overlapX < overlapY) {
      // Resolve horizontally
      if (obj1.x < obj2.x) {
        obj1.x -= overlapX / 2
        obj2.x += overlapX / 2
      } else {
        obj1.x += overlapX / 2
        obj2.x -= overlapX / 2
      }
      
      // Exchange velocities with damping
      const vx1 = obj1.vx * this.bounceDamping
      obj1.vx = obj2.vx * this.bounceDamping
      obj2.vx = vx1
    } else {
      // Resolve vertically
      if (obj1.y < obj2.y) {
        obj1.y -= overlapY / 2
        obj2.y += overlapY / 2
      } else {
        obj1.y += overlapY / 2
        obj2.y -= overlapY / 2
      }
      
      // Exchange velocities with damping
      const vy1 = obj1.vy * this.bounceDamping
      obj1.vy = obj2.vy * this.bounceDamping
      obj2.vy = vy1
    }
  }
  
  // Apply gravity to an object
  applyGravity(obj, deltaTime) {
    if (obj.vy !== undefined) {
      obj.vy += this.gravity * deltaTime / 16.67
    }
  }
  
  // Apply friction to an object
  applyFriction(obj) {
    if (obj.vx !== undefined) {
      obj.vx *= this.friction
    }
    if (obj.vy !== undefined) {
      obj.vy *= this.friction
    }
  }
  
  // Update object position based on velocity
  updatePosition(obj, deltaTime) {
    if (obj.vx !== undefined) {
      obj.x += obj.vx * deltaTime / 16.67
    }
    if (obj.vy !== undefined) {
      obj.y += obj.vy * deltaTime / 16.67
    }
  }
  
  // Calculate center of mass for a group of objects
  calculateCenterOfMass(objects) {
    if (objects.length === 0) return { x: 0, y: 0 }
    
    let totalMass = 0
    let totalX = 0
    let totalY = 0
    
    objects.forEach(obj => {
      const mass = obj.w * obj.h // Area as mass approximation
      totalMass += mass
      totalX += obj.x * mass
      totalY += obj.y * mass
    })
    
    return {
      x: totalX / totalMass,
      y: totalY / totalMass
    }
  }
  
  // Check if a stack of objects is stable
  checkStackStability(stack, maxTilt = 30) {
    if (stack.length < 2) return true
    
    // Calculate total displacement from center
    let totalOffset = 0
    const baseX = stack[0].x
    
    for (let i = 1; i < stack.length; i++) {
      totalOffset += Math.abs(stack[i].x - baseX)
    }
    
    // Check if total offset exceeds stability threshold
    const maxOffset = stack.length * maxTilt
    return totalOffset <= maxOffset
  }
  
  // Simulate wobble effect on a stack
  applyWobble(stack, intensity = 1) {
    if (stack.length === 0) return
    
    // Apply decreasing wobble from top to bottom
    for (let i = stack.length - 1; i >= 0; i--) {
      const wobbleAmount = intensity * (i / stack.length) * 0.1
      stack[i].tilt = (stack[i].tilt || 0) + wobbleAmount * (Math.random() - 0.5)
      
      // Clamp tilt to reasonable values
      stack[i].tilt = Math.max(-0.2, Math.min(0.2, stack[i].tilt))
    }
  }
  
  // Calculate stability score for placement
  calculatePlacementScore(newBlock, targetBlock) {
    if (!targetBlock) return 1 // Perfect score for platform placement
    
    const centerDistance = Math.abs(newBlock.x - targetBlock.x)
    const maxDistance = (newBlock.w + targetBlock.w) / 2
    const overlapRatio = this.checkOverlap(newBlock, targetBlock) / Math.min(newBlock.w, targetBlock.w)
    
    // Score based on center alignment and overlap
    const alignmentScore = 1 - (centerDistance / maxDistance)
    const overlapScore = overlapRatio
    
    return Math.max(0, (alignmentScore + overlapScore) / 2)
  }
  
  // Add physics-based rotation to landed blocks
  addRotationMomentum(block, momentum) {
    if (!block.angularVelocity) {
      block.angularVelocity = 0
    }
    block.angularVelocity += momentum
  }
  
  // Update rotation with damping
  updateRotation(block, deltaTime) {
    if (block.angularVelocity === undefined) return
    
    // Apply angular velocity
    block.tilt = (block.tilt || 0) + block.angularVelocity * deltaTime / 16.67
    
    // Apply angular damping
    block.angularVelocity *= 0.95
    
    // Stop tiny rotations
    if (Math.abs(block.angularVelocity) < 0.001) {
      block.angularVelocity = 0
    }
    
    // Clamp rotation
    block.tilt = Math.max(-0.3, Math.min(0.3, block.tilt))
  }
  
  // Simulate chain reaction when tower becomes unstable
  simulateCollapse(stack, startIndex = 0) {
    const collapsingBlocks = []
    
    for (let i = startIndex; i < stack.length; i++) {
      const block = stack[i]
      
      // Add falling physics
      block.state = 'falling'
      block.vx = (Math.random() - 0.5) * 2
      block.vy = 0
      block.angularVelocity = (Math.random() - 0.5) * 0.1
      
      collapsingBlocks.push(block)
    }
    
    // Remove collapsing blocks from stack
    stack.splice(startIndex, stack.length - startIndex)
    
    return collapsingBlocks
  }
}