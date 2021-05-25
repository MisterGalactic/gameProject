// CONSTANTS
const GAME_WIDTH = 1000
const GAME_HEIGHT = 500
const CHARACTER_WIDTH = 25
const CHARACTER_HEIGHT = 25
const FPS = 60
const LOOP_INTERVAL = Math.round(1000 / FPS)
const VELOCITY = 2.5
const $gameScreen = $('#game-screen')

// Game Loop
let gameLoop
const playerTroops = [], computerTroops = []

// Character
const $character = $('#character')
let character = {
  position: { x: 0, y: 0 },
  movement: { up: false, down: false, spawn: false}
}

// Toggle which direction the character is moving to
const setChararacterMovement = (value, keyCode) => {
  switch (keyCode) {
    case 38:
      character.movement.up = value
      break
    case 40:
      character.movement.down = value
      break
    case 32:
      character.movement.spawn = value
  }
}

// Handling Key Down
const handleKeyDown = (e) => {
  setChararacterMovement(true, e.keyCode)
}

// Handling Key Up
const handleKeyUp = (e) => {
  const { keyCode } = e
  setChararacterMovement(false, e.keyCode)
}

const generateRandomID = () => {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9)
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

const generateRandomHP = (maxHealth) => {
  return maxHealth > 5 ? getRandomInt(5, maxHealth) : alert(`Health must be greater than 5`)
}

const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
}

//Generate Enemy
const generateEnemy = (size = 50, right = 0, top = 0, id = '', health = 0) => {
  return `
    <div 
      id="${id}" 
      class="enemy" 
      style="width:${size}px; height:${size}px; right:${right}px; top:${top}px;"
    >${health}</div>
  `
}

//Generate Troops
const generateTroops = (size = 25, left = 0, top = 0, id = '', health = 0) => {
  return `
    <div 
      id="${id}" 
      class="troop" 
      style="width:${size}px; height:${size}px; left:${left}px; top:${top}px; display: none;"
    >${health}</div>
  `
}

// Everytime this gets invoked, update character position
const updateCharacterMovements = () => {
  const { position: { x, y }, movement: { up, down, spawn } } = character
  let newY = y

  if (up) {
    newY = y - VELOCITY < 0 ? 0 : newY - VELOCITY
  }
  if (down) {
    newY = y + CHARACTER_HEIGHT + VELOCITY > GAME_HEIGHT ? GAME_HEIGHT - CHARACTER_HEIGHT : newY + VELOCITY
  }

  if (spawn) {
    console.log(`spawning player troop`)
    const randomID = generateRandomID()
    const randomHealth = generateRandomHP(10)
    const newTroop = {
      id: randomID,
      health: randomHealth,
      $elem: $(generateTroops(25, x, newY, randomID, randomHealth)),
      position: { x, y: newY },
      speed: 2,
    }
  
    newTroop.$elem.appendTo($gameScreen).fadeIn(300)
    playerTroops.push(newTroop)
    character.movement.spawn = false
    spawnEnemy()
  }

  character.position.y = newY
  $character.css('left', x).css('top', newY)

}

const spawnEnemy = () => {
  console.log(`spawning enemy troop`)
  const randomID = generateRandomID()
  const randomHealth = generateRandomHP(15)
  const newY = getRandomArbitrary(0, GAME_HEIGHT - 50)
  const newX = 0
  const newEnemy = {
    id: randomID,
    health: randomHealth,
    $elem: $(generateEnemy(50, newX, newY, randomID, randomHealth)),
    position: { x: newX, y: newY },
    speed: 2,
  }
  const width = Number(newEnemy.$elem.css('width').replace('px', ''))
  const speed = newEnemy.speed

  newEnemy.$elem.appendTo($gameScreen).fadeIn(300)
  computerTroops.push(newEnemy)
}

const updateMinionMovements = (troops, direction) => {

}

const updateEnemyMovements = () => {
  let computerTroopsToBeRemoved = []

  computerTroops.forEach((ct, index) => {
    const { $elem, position: { x }, speed } = ct
    const width = Number($elem.css('width').replace('px', ''))

    ct.position.x = x + width + speed > GAME_WIDTH ? GAME_WIDTH - width : x + speed
    $elem.css('right', `${ct.position.x}px`)

    if (ct.position.x + width >= GAME_WIDTH) {
      console.log('Remove Enemy')
      computerTroopsToBeRemoved.push(ct)
    }
  })

  computerTroopsToBeRemoved.forEach((ctbr) => {
    const { $elem, id } = ctbr

    console.log('remove enemy from html')
    $elem.remove()

    console.log('remove enemy from computerTroops array')
    const indexLocation = computerTroops.findIndex((ct) => ct.id === id)
    computerTroops.splice(indexLocation, 1)
  })

  computerTroopsToBeRemoved = []
}

const updateTroopMovements = () => {
  let troopsToBeRemoved = []

  playerTroops.forEach((pt, index) => {
    const { $elem, position: { x }, speed } = pt
    const width = Number($elem.css('width').replace('px', ''))

    pt.position.x = x + width + speed > GAME_WIDTH ? GAME_WIDTH - width : x + speed
    $elem.css('left', `${pt.position.x}px`)

    if (pt.position.x + width >= GAME_WIDTH) {
      console.log('Remove Self')
      troopsToBeRemoved.push(pt)
    }
  })

  troopsToBeRemoved.forEach((tbr) => {
    const { $elem, id } = tbr

    console.log('remove self from html')
    $elem.remove()

    console.log('remove self from playerTroops array')
    const indexLocation = playerTroops.findIndex((pt) => pt.id === id)
    playerTroops.splice(indexLocation, 1)
  })

  troopsToBeRemoved = []
}

const update = () => {
  updateCharacterMovements()
  updateTroopMovements()
  updateEnemyMovements()
  // detectCollision()
}

const init = () => {
  $(document).on('keydown', handleKeyDown)
  $(document).on('keyup', handleKeyUp)

  gameLoop = setInterval(update, LOOP_INTERVAL)
}

init()
