import { generateRandomID, generateRandomHP, getRandomArbitrary } from './utils.js'

// CONSTANTS
const FPS = 60
const LOOP_INTERVAL = Math.round(1000 / FPS)
const $gameScreen = $('#game-screen')
const $startBTN = $('#startButton')

// Game Loop
const GAME_WIDTH = 1000
const GAME_HEIGHT = 500
const playerTroops = [], computerTroops = []
let playerTroopsTBR = [], computerTroopsTBR = []
let gameLoop, gameHasStarted

// Character
const ACCEPTED_KEYS = ['q', 'w', 'e']
const CHARACTER_VELOCITY = 2.5
const CHARACTER_WIDTH = 25
const CHARACTER_HEIGHT = 25
let character = {
  $elem: $('#character'),
  position: { x: $('#character').position().left, y: $('#character').position().top },
  controls: { up: false, down: false, spawn: false },
  troopSelection: 'q'
}

// PlayerHealth
const PLAYER_HP_GEN_TIME = 10000
let player = {
  $elem: $('#playerHealth'),
  health: 10,
  prevGenTime: null
}

// EnemyHealth
const ENEMY_HP_GEN_TIME = 10000
let enemy = {
  $elem: $('#enemyHealth'),
  health: 10,
  prevGenTime: null
}

// Enemy
const ENEMY_SPAWN_TIME = 5000
let prevEnemySpawnTime

// Money
const MONEY_GEN_TIME = 1000
let money = {
  $elem: $('#moneyBalance'),
  balance: 50,
  prevGenTime: null
}

const generator = (obj, key, GEN_TIME) => {
  const currTime = new Date().getTime()
  const timeDiff = currTime - (obj.prevGenTime || 0)

  if (gameHasStarted && timeDiff >= GEN_TIME && obj[key] < 100) {
    const increment = 1
    
    obj[key] = obj[key] + increment
    obj.prevGenTime = currTime
    obj.$elem.text(`${obj[key]}`)
  }
}

const updateCharacterMovements = () => {
  // Everytime this gets invoked, update character position
  const { position: { y }, controls: { up, down } } = character
  let newY = y

  if (up) newY = y - CHARACTER_VELOCITY < 0 ? 0 : newY - CHARACTER_VELOCITY
  if (down) newY = y + CHARACTER_HEIGHT + CHARACTER_VELOCITY > GAME_HEIGHT ? GAME_HEIGHT - CHARACTER_HEIGHT : newY + CHARACTER_VELOCITY

  character.position.y = newY
  character.$elem.css('top', newY)
}

const displayCost = (cost) => {
  const messageDiv = `<div id="message" style="display:none; z-index: 9">-$${cost}</div>`
  $(messageDiv).appendTo($gameScreen).fadeIn(300).fadeOut(1500, function() {
    $("#message").remove()
  })
}

const displayCantAfford = (amount) => {
  const messageDiv = `<div id="message" style="display:none; z-index: 9">Can't afford. Need $${amount} more.</div>`
  $(messageDiv).appendTo($gameScreen).fadeIn(300).fadeOut(2500, function() {
    $("#message").remove()
  })
}

const generateCharacterMinion = (size = 25, left = 0, top = 0, id = '', health = 0, troop = '') => {
  //Generate Troop
  return `
    <div 
      id="${id}" 
      class="${troop}" 
      style="width:${size}px; height:${size}px; left:${left}px; top:${top}px;"
    >${health}</div>
  `
}

const spawnCharacterMinions = () => {
  const { position: { x, y }, troopSelection, controls: { spawn } } = character

  if (spawn) {
    const randomID = generateRandomID()
    let health, troopType, speed, size, cost

    switch(troopSelection) {
      case 'e': {
        health = 200 // generateRandomHP(6)
        troopType = `playerScout`
        speed = 8
        size = 10
        cost = 7
        break
      }
      case 'w': {
        health = generateRandomHP(60)
        troopType = `playerTank`
        speed = 1
        size = 50
        cost = 30
        break
      }
      default: {
        health = generateRandomHP(20)
        troopType = `playerFootman`
        speed = 2
        size = 25
        cost = 20
        break
      }
    }

    const newTroop = {
      id: randomID,
      cost,
      health,
      troopType,
      speed,
      $elem: $(generateCharacterMinion(size, x, y, randomID, health, troopType)),
      position: { x: x, y: y }
    }
  
    if (newTroop.cost <= money.balance) {
      money.balance = money.balance - newTroop.cost
      money.$elem.text(`${money.balance}`)

      newTroop.$elem.appendTo($gameScreen).fadeIn(300)
      playerTroops.push(newTroop)

      $("#message").remove()
      displayCost(newTroop.cost) 
    } else {
      const needAmount = newTroop.cost - money.balance
      $("#message").remove()
      displayCantAfford(needAmount)
    }
  }

  character.controls.spawn = false
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
    const randomHealth = generateRandomHP(33)
  
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

const updateMinionNumber = () => {
  $('#troopCount').text(`${playerTroops.length}`)
  $('#enemyCount').text(`${computerTroops.length}`)  
}

const updateMinionMovements = (obj, minions, minionsTBR, direction) => {
  minions.forEach((minion) => {
    const { $elem, position: { x }, speed } = minion
    const width = Number($elem.css('width').replace('px', ''))

    minion.position.x = x + width + speed > GAME_WIDTH ? GAME_WIDTH - width : x + speed
    $elem.css(`${direction}`, `${minion.position.x}px`)

    if (minion.position.x + width >= GAME_WIDTH) {
      // console.log('Remove minion')
      minionsTBR.push(minion)

      obj.health = obj.health - minion.health
      obj.$elem.text(`${obj.health}`)
    }
  })
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

const displayGameOver = () => {
  const messageDiv = `<div id="message" style="display:none; z-index: 9">Game Over!</div>`
  $(messageDiv).appendTo($gameScreen).fadeIn(300)
}

const displayWin = () => {
  const messageDiv = `<div id="message" style="display:none; z-index: 9">Victory!</div>`
  $(messageDiv).appendTo($gameScreen).fadeIn(300)
}

const checkWinner = () => {
  if (gameHasStarted && (enemy.health <= 0 || player.health <= 0)) {
    $("#message").remove()
    gameHasStarted = false
    clearInterval(gameLoop)
    gameLoop = null
    $startBTN.show()
    
    if (player.health <= 0) {
      console.log(`GameOver`)
      displayGameOver()
    } else {
      console.log(`Victory`)
      displayWin()
    }
  }
}

const update = () => {
  generator(money, 'balance', MONEY_GEN_TIME)
  generator(player, 'health', PLAYER_HP_GEN_TIME)
  generator(enemy, 'health', ENEMY_HP_GEN_TIME)
  
  updateCharacterMovements()

  spawnCharacterMinions()
  spawnEnemyMinions()
  updateMinionNumber()

  updateMinionMovements(enemy, playerTroops, playerTroopsTBR, 'left')
  updateMinionMovements(player, computerTroops, computerTroopsTBR, 'right')

  collisionDetection()
  removeMinions()

  checkWinner()
}

const startGame = () => {
  if (!gameLoop) {
    console.log(`game started`)

    // const playerTroops = [], computerTroops = []
    // let playerTroopsTBR = [], computerTroopsTBR = []
    // player.health & prevGenTime
    // enemy.health & prevGenTime
    // money.balance & prevGenTime
  
    $startBTN.hide()
    money.$elem.text(`${money.balance}`)

    gameLoop = setInterval(update, LOOP_INTERVAL)
    gameHasStarted = true
  }
}

const setCharacterControls = (value, keyCode) => {
  // Toggle which direction the character is moving to
  switch (keyCode) {
    case 38:
      character.controls.up = value
      break
    case 40:
      character.controls.down = value
      break
    case 32: {
      startGame()
      character.controls.spawn = value
      break
    }
  }
}

const handleKeyDown = (e) => {
  // Handling Key Down
  setCharacterControls(true, e.keyCode)
}

const handleKeyUp = (e) => {
  // Handling Key Up
  setCharacterControls(false, e.keyCode)
}

const handleTroopSelection = (e) => {
  // Toggle troop selection
  if (ACCEPTED_KEYS.includes(e.key)) {
    $('#troopList').find('.selected').removeClass('selected')

    switch(e.key) {
      case 'e': {
        $('#troopList').find(`#playerScout`).addClass('selected')
        break
      }
      case 'w': {
        $('#troopList').find(`#playerTank`).addClass('selected')
        break
      }
      default: {
        $('#troopList').find(`#playerFootman`).addClass('selected')
        break
      }
    }

    character.troopSelection = e.key
  }
}

const init = () => {
  $(document).on('keydown', handleKeyDown)
  $(document).on('keyup', handleKeyUp)
  $(document).on('keypress', handleTroopSelection)

  $gameScreen.on('click', '#startButton', startGame)
}

init()

