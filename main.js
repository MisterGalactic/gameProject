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

const setCharacterMovement = (value, keyCode) => {
  // Toggle which direction the character is moving to
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

const handleKeyDown = (e) => {
  // Handling Key Down
  setCharacterMovement(true, e.keyCode)
}

const handleKeyUp = (e) => {
  // Handling Key Up
  const { keyCode } = e
  setCharacterMovement(false, e.keyCode)
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
    spawnTroop()
    // spawnEnemy()
    character.movement.spawn = false  
  }

  character.position.y = newY
  $character.css('left', x).css('top', newY)
}


const spawnTroop = () => {
  // console.log(`spawning player troop`)
  const randomID = generateRandomID()
  const randomHealth = generateRandomHP(10)
  // const randomHealth = 5

  const x = character.position.x
  const newY = character.position.y
  const newTroop = {
    id: randomID,
    health: randomHealth,
    $elem: $(generateTroops(25, x, newY, randomID, randomHealth)),
    position: { x, y: newY },
    speed: 2,
  }

  newTroop.$elem.appendTo($gameScreen).fadeIn(300)
  playerTroops.push(newTroop)
}

const accessTroopInfo = () => {
  // const troopX = playerTroops[0].position.x
  // const troopY = playerTroops[0].position.y
  // const troopWidth = Number(playerTroops[0].$elem.css('width').replace('px', ''))
  // const troopHeight = Number(playerTroops[0].$elem.css('height').replace('px', ''))

  // const enemyX = GAME_WIDTH - computerTroops[0].position.x
  // const enemyY = computerTroops[0].position.y
  // const enemyWidth = Number(computerTroops[0].$elem.css('width').replace('px', ''))
  // const enemyHeight = Number(computerTroops[0].$elem.css('height').replace('px', ''))

  // console.log(`troopX:${troopX},troopY:${troopY},troopWidth${troopWidth},troopHeight${troopHeight}`)
  // console.log(`enemyX:${enemyX},enemyY:${enemyY},enemyWidth${enemyWidth},enemyHeight${enemyHeight}`)

  // if (troopX < enemyX + enemyWidth &&
  //   troopX + troopWidth > enemyX && 
  //   troopY < enemyY + enemyHeight &&
  //   troopY + troopHeight > enemyY) {
  //     console.log(`collision!`)
  // }
  let minionToBeRemoved = []
  let playerTroopToBeRemoved = []
  let computerTroopToBeRemoved = []

  playerTroops.forEach((pt, index) => {
    const { $elem, position: { x, y } } = pt
    const ptX = pt.position.x
    const ptY = pt.position.y
    const ptWidth = Number($elem.css('width').replace('px', ''))
    const ptHeight = Number($elem.css('height').replace('px', ''))



    computerTroops.forEach((ct, index) => {
      const { $elem, position: { x, y } } = ct
      const ctX = GAME_WIDTH - ct.position.x
      const ctY = ct.position.y
      const ctWidth = Number($elem.css('width').replace('px', ''))
      const ctHeight = Number($elem.css('height').replace('px', ''))

      if (ptX < ctX + ctWidth && 
          ptX + ptWidth > ctX && 
          ptY < ctY + ctHeight &&
          ptY + ptHeight > ctY) {

          pt.$elem.css('background','red')
          ct.$elem.css('background','red')
          
          const troopHealth = Number(pt.$elem.text())
          const enemyHealth = Number(ct.$elem.text())

          if (enemyHealth > troopHealth) {
            const ctRemainingHealth = enemyHealth - troopHealth
            ct.$elem.text(`${ctRemainingHealth}`)
            minionToBeRemoved.push(pt)

            // pt.$elem.remove()
            minionToBeRemoved.forEach((mtbr) => {
              const { $elem, id } = mtbr
          
              // console.log('remove minion from html')
              $elem.remove()
          
              // console.log('remove minion from troops array')
              const indexLocation = playerTroops.findIndex((pt) => pt.id === id)
              playerTroops.splice(indexLocation, 1)
            })
          }

          if (troopHealth > enemyHealth) {
            const ptRemainingHealth = troopHealth - enemyHealth
            pt.$elem.text(`${ptRemainingHealth}`)
            minionToBeRemoved.push(ct)
            // ct.$elem.remove()
            minionToBeRemoved.forEach((mtbr) => {
              const { $elem, id } = mtbr
          
              // console.log('remove minion from html')
              $elem.remove()
          
              // console.log('remove minion from troops array')
              const indexLocation = computerTroops.findIndex((ct) => ct.id === id)
              computerTroops.splice(indexLocation, 1)
            })
          }

          if (troopHealth === enemyHealth) {

            playerTroopToBeRemoved.push(pt)
            computerTroopToBeRemoved.push(ct)

            // ct.$elem.remove()
            playerTroopToBeRemoved.forEach((mtbr) => {
              const { $elem, id } = mtbr
          
              // console.log('remove minion from html')
              $elem.remove()
          
              // console.log('remove minion from troops array')
              const indexLocation = playerTroops.findIndex((pt) => pt.id === id)
              playerTroops.splice(indexLocation, 1)
            })

            computerTroopToBeRemoved.forEach((mtbr) => {
              const { $elem, id } = mtbr
          
              // console.log('remove minion from html')
              $elem.remove()
          
              // console.log('remove minion from troops array')
              const indexLocation = computerTroops.findIndex((ct) => ct.id === id)
              computerTroops.splice(indexLocation, 1)
            })
          }
      }
    })
    minionToBeRemoved = []
    playerTroopToBeRemoved = []
    computerTroopToBeRemoved = []
  })
}

const indexLocation2 = computerTroops.findIndex((ct) => ct.id === id)
computerTroops.splice(indexLocation2, 1)

const spawnEnemy = () => {
  // console.log(`spawning enemy troop`)
  const randomID = generateRandomID()
  const randomHealth = generateRandomHP(15)
  // const randomHealth = 5

  const newY = getRandomArbitrary(0, GAME_HEIGHT - 50)
  const newX = 0
  const newEnemy = {
    id: randomID,
    health: randomHealth,
    $elem: $(generateEnemy(50, newX, newY, randomID, randomHealth)),
    position: { x: newX, y: newY },
    speed: 0.7,
  }
  const width = Number(newEnemy.$elem.css('width').replace('px', ''))
  const speed = newEnemy.speed

  newEnemy.$elem.appendTo($gameScreen).fadeIn(300)
  computerTroops.push(newEnemy)
}

const updateMinionMovements = (troops, direction) => {
  let minionToBeRemoved = []

  troops.forEach((mt, index) => {
    const { $elem, position: { x }, speed } = mt
    const width = Number($elem.css('width').replace('px', ''))

    mt.position.x = x + width + speed > GAME_WIDTH ? GAME_WIDTH - width : x + speed
    $elem.css(`${direction}`, `${mt.position.x}px`)

    if (mt.position.x + width >= GAME_WIDTH) {
      // console.log('Remove minion')
      minionToBeRemoved.push(mt)
    }
  })

  minionToBeRemoved.forEach((mtbr) => {
    const { $elem, id } = mtbr

    // console.log('remove minion from html')
    $elem.remove()

    // console.log('remove minion from troops array')
    const indexLocation = troops.findIndex((mt) => mt.id === id)
    troops.splice(indexLocation, 1)
  })

  minionToBeRemoved = []
}

const updateMinionNumber = () => {
  $('#troopCount').text(`${playerTroops.length}`)
  $('#enemyCount').text(`${computerTroops.length}`)  
}


const update = () => {
  updateCharacterMovements()
  updateMinionMovements(playerTroops,'left')
  updateMinionMovements(computerTroops,'right')
  updateMinionNumber()
  accessTroopInfo()
  // detectCollision()
}

const init = () => {
  $(document).on('keydown', handleKeyDown)
  $(document).on('keyup', handleKeyUp)

  // gameLoop = setInterval(update, LOOP_INTERVAL)
  // spawnTime = setInterval(spawnEnemy, 3333)
}

init()

