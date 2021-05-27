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
let gameLoop, gameHasStarted
const playerTroops = [], computerTroops = []
let playerTroopsTBR = [], computerTroopsTBR = []

// Character
const $character = $('#character')
let character = {
  position: { x: 0, y: 0 },
  controls: { up: false, down: false, spawn: false, spawn2: false},
  troopSelection: 'q'
}

// Enemy
const ENEMY_SPAWN_TIME = 5000
let prevEnemySpawnTime

const setCharacterControls = (value, keyCode) => {
  // Toggle which direction the character is moving to
  switch (keyCode) {
    case 38:
      character.controls.up = value
      break
    case 40:
      character.controls.down = value
      break
    case 32:
      character.controls.spawn = value
      break
    case 81:
      character.controls.spawn2 = value
  }

}

const handleKeyDown = (e) => {
  // Handling Key Down
  setCharacterControls(true, e.keyCode)
}

const handleKeyUp = (e) => {
  // Handling Key Up
  const { keyCode } = e
  setCharacterControls(false, e.keyCode)
}

const updateCharacterMovements = () => {
  // Everytime this gets invoked, update character position
  const { position: { y }, controls: { up, down } } = character
  let newY = y

  if (up) newY = y - VELOCITY < 0 ? 0 : newY - VELOCITY
  if (down) newY = y + CHARACTER_HEIGHT + VELOCITY > GAME_HEIGHT ? GAME_HEIGHT - CHARACTER_HEIGHT : newY + VELOCITY

  character.position.y = newY
  $character.css('top', newY)
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

const generateCharacterMinion = (size = 25, left = 0, top = 0, id = '', health = 0, troop = '') => {
  //Generate Enemy
  return `
    <div 
      id="${id}" 
      class="${troop}" 
      style="width:${size}px; height:${size}px; left:${left}px; top:${top}px;"
    >${health}</div>
  `
}

const spawnCharacterMinions = () => {
  const { position: { x, y }, controls: { spawn, spawn2 } } = character

  if (spawn) {

    gameHasStarted = true
    $('#startButton').remove()

    const randomID = generateRandomID()
    const randomHealth = generateRandomHP(10)
    const troop = `playerFootman`

    const newTroop = {
      id: randomID,
      health: randomHealth,
      troopType: troop,
      $elem: $(generateCharacterMinion(25, x, y, randomID, randomHealth, troop)),
      position: { x: x, y: y },
      speed: 2,
    }

    newTroop.$elem.appendTo($gameScreen).fadeIn(300)
    playerTroops.push(newTroop)
    // gameHasStarted = true
  } else if (spawn2) {

    gameHasStarted = true
    $('#startButton').remove()

    const randomID = generateRandomID()
    const randomHealth = generateRandomHP(20)
    const troop = `playerTank`
    // const randomHealth = 5

    const newTroop = {
      id: randomID,
      health: randomHealth,
      troopType: troop,
      $elem: $(generateCharacterMinion(75, x, y, randomID, randomHealth, troop)),
      position: { x: x, y: y },
      speed: 0.45,
    }

    newTroop.$elem.appendTo($gameScreen).fadeIn(300)
    playerTroops.push(newTroop)
    // gameHasStarted = true

  }

  character.controls.spawn = false  
  character.controls.spawn2 = false  

}

const generateEnemyMinion = (size = 50, right = 0, top = 0, id = '', health = 0, troop = '') => {
  //Generate Enemy
  return `
    <div 
      id="${id}" 
      class="${troop}" 
      style="width:${size}px; height:${size}px; right:${right}px; top:${top}px;"
    >${health}</div>
  `
}

const spawnEnemyMinions = () => {
  const currTime = new Date().getTime()
  const timeDiff = currTime - (prevEnemySpawnTime || 0)

  if (gameHasStarted && timeDiff >= ENEMY_SPAWN_TIME) {
    const randomID = generateRandomID()
    const randomHealth = generateRandomHP(15)
  
    const x = 0
    const y =  getRandomArbitrary(0, GAME_HEIGHT - 50)
    const troop = `enemyFootman`
    const newEnemy = {
      id: randomID,
      health: randomHealth,
      troopType: troop,
      $elem: $(generateEnemyMinion(50, x, y, randomID, randomHealth, troop)),
      position: { x: x, y: y },
      speed: 0.7,
    }
  
    newEnemy.$elem.appendTo($gameScreen).fadeIn(300)
    computerTroops.push(newEnemy)

    prevEnemySpawnTime = currTime
  }
}

const updateMinionMovements = (minions, minionsTBR, direction) => {
  minions.forEach((minion) => {
    const { $elem, position: { x }, speed } = minion
    const width = Number($elem.css('width').replace('px', ''))

    minion.position.x = x + width + speed > GAME_WIDTH ? GAME_WIDTH - width : x + speed
    $elem.css(`${direction}`, `${minion.position.x}px`)

    if (minion.position.x + width >= GAME_WIDTH) {
      // console.log('Remove minion')
      minionsTBR.push(minion)
    }
  })
}

const updateMinionNumber = () => {
  $('#troopCount').text(`${playerTroops.length}`)
  $('#enemyCount').text(`${computerTroops.length}`)  
}

const collisionDetection = () => {
  playerTroops.forEach((pt) => {
    const { $elem: $ptElem, position: { x: ptX, y: ptY }, health: ptHealth } = pt
    const ptWidth = Number($ptElem.css('width').replace('px', ''))
    const ptHeight = Number($ptElem.css('height').replace('px', ''))

    computerTroops.forEach((ct) => {
      const { $elem: $ctElem, position: { x: ctXOriginal, y: ctY }, health: ctHealth } = ct
      const ctWidth = Number($ctElem.css('width').replace('px', ''))
      const ctHeight = Number($ctElem.css('height').replace('px', ''))
      const ctX = GAME_WIDTH - ctXOriginal - ctWidth

      if (ptX < ctX + ctWidth && ptX + ptWidth > ctX && ptY < ctY + ctHeight && ptY + ptHeight > ctY) {
        $ptElem.css('background','red')
        $ctElem.css('background','red')

        if (ctHealth > ptHealth) {
          console.log(ctHealth, ptHealth)
          const ctRemainingHealth = ctHealth - ptHealth
          $ctElem.text(`${ctRemainingHealth}`)
          ct.health = ctRemainingHealth

          playerTroopsTBR.push(pt)
        } else if (ctHealth < ptHealth) {
          const ptRemainingHealth = ptHealth - ctHealth
          $ptElem.text(`${ptRemainingHealth}`)
          pt.health = ptRemainingHealth

          computerTroopsTBR.push(ct)
        } else {
          computerTroopsTBR.push(ct)
          playerTroopsTBR.push(pt)
        }
      }
    })
  })
}

const removeMinions = () => {
  computerTroopsTBR.forEach((ctbr) => {
    const { $elem, id } = ctbr
    const indexLocation = computerTroops.findIndex((minion) => minion.id === id)
  
    $elem.remove()
    computerTroops.splice(indexLocation, 1)
  })

  playerTroopsTBR.forEach((ptbr) => {
    const { $elem, id } = ptbr
    const indexLocation = playerTroops.findIndex((minion) => minion.id === id)
  
    $elem.remove()
    playerTroops.splice(indexLocation, 1)
  })

  computerTroopsTBR = []
  playerTroopsTBR = []
}

const update = () => {
  updateCharacterMovements()

  spawnCharacterMinions()
  spawnEnemyMinions()

  updateMinionMovements(playerTroops, playerTroopsTBR, 'left')
  updateMinionMovements(computerTroops, computerTroopsTBR, 'right')
  updateMinionNumber()

  collisionDetection()
  removeMinions()
}

const init = () => {
  $(document).on('keydown', handleKeyDown)
  $(document).on('keyup', handleKeyUp)

  gameLoop = setInterval(update, LOOP_INTERVAL)
}

$('#game-screen').on('click', '#startButton', function(e) {
  gameHasStarted = true
  console.log(`game started`)
  $(e.target).remove()

})

init()

