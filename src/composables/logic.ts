import type { BlockState } from '~/types'

const directions = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
]

type GameStatus = 'play' | 'won' | 'lost'

interface GameState {
  board: BlockState[][]
  mineGenerated: boolean
  status: GameStatus
  startMS: number
  endMS: number
}

export class GamePlay {
  state = ref() as Ref<GameState>

  constructor(
    public width: number,
    public height: number,
    public mines: number,
  ) {
    this.reset()
  }

  get board(): BlockState[][] {
    return this.state.value!.board
  }

  get blocks() {
    return this.state.value.board.flat()
  }

  reset(width = this.width, height = this.height, mines = this.mines) {
    this.width = width
    this.height = height
    this.mines = mines

    this.state.value = {
      startMS: +Date.now(),
      endMS: NaN,
      board: Array.from({ length: this.height }, (_, y) =>
        Array.from({ length: this.width },
          (_, x): BlockState => ({
            x,
            y,
            revealed: false,
            adjacentMines: 0,
            flagged: false,
          }),
        ),
      ),
      mineGenerated: false,
      status: 'play',
    }
  }

  random(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  randomInt(min: number, max: number) {
    return Math.round(this.random(min, max))
  }

  generateMines(state: BlockState[][], initial: BlockState) {
    const placeRandom = () => {
      const x = this.randomInt(0, this.width - 1)
      const y = this.randomInt(0, this.height - 1)
      const block = state[y][x]
      if (Math.abs(initial.x - block.x) <= 1 && Math.abs(initial.y - block.y) <= 1)
        return false
      if (block.mine)
        return false

      block.mine = true
      return true
    }

    Array.from({ length: this.mines }, () => null)
      .forEach(() => {
        // eslint-disable-next-line no-empty
        while (!placeRandom()) {}
      })

    this.updateNumbers(state)
  }

  updateNumbers(state: BlockState[][]) {
    state.forEach((row) => {
      row.forEach((block) => {
        if (block.mine)
          return
        this.getSiblings(block).forEach((b) => {
          if (b.mine)
            block.adjacentMines++
        })
      })
    })
  }

  expendZero(block: BlockState) {
    if (block.adjacentMines)
      return

    this.getSiblings(block).forEach((b) => {
      if (!b.revealed) {
        b.revealed = true
        this.expendZero(b)
      }
    })
  }

  onClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return

    if (!this.state.value.mineGenerated) {
      this.generateMines(this.board, block)
      this.state.value.mineGenerated = true
    }

    block.revealed = true
    if (block.mine) {
      this.onGameOver('lost')
      this.showAllMines()
    }
    else {
      this.expendZero(block)
    }
  }

  onRightClick(block: BlockState) {
    if (this.state.value.status !== 'play')
      return

    if (block.revealed)
      return
    block.flagged = !block.flagged
  }

  getSiblings(block: BlockState) {
    return directions.map(([dx, dy]) => {
      const x2 = block.x + dx
      const y2 = block.y + dy
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height)
        return undefined
      return this.board[y2][x2]
    }).filter(Boolean) as BlockState[]
  }

  showAllMines() {
    this.board.flat().forEach((i) => {
      if (i.mine)
        i.revealed = true
    })
  }

  checkGameState() {
    const blocks = this.board.flat()
    if (!blocks.some(block => !block.mine && !block.revealed))
      this.onGameOver('won')
  }

  autoExpand(block: BlockState) {
    const siblings = this.getSiblings(block)
    const flags = siblings.reduce((sum, b) => sum + (b.flagged ? 1 : 0), 0)
    const notRevealed = siblings.reduce((sum, b) => sum + (!b.revealed && !b.flagged ? 1 : 0), 0)
    if (flags === block.adjacentMines) {
      siblings.some((b) => {
        if (!b.revealed && !b.flagged) {
          b.revealed = true
          if (b.mine) {
            this.onGameOver('lost')
            return true
          }
          this.expendZero(b)
        }
        return false
      })
    }
    const missingFlags = block.adjacentMines - flags
    if (notRevealed === missingFlags) {
      siblings.forEach((b) => {
        if (!b.revealed && !b.flagged)
          b.flagged = true
      })
    }

    const unRevealedAndFlag = siblings.reduce((sum, b) => sum + (b.flagged || !b.revealed ? 1 : 0), 0)
    if (unRevealedAndFlag === block.adjacentMines) {
      siblings.forEach((b) => {
        if (!b.revealed && !b.flagged)
          b.flagged = true
      })
    }
  }

  async onGameOver(status: GameStatus) {
    this.state.value.status = status
    this.state.value.endMS = +Date.now()
    if (status === 'lost') {
      this.showAllMines()
      setTimeout(() => {
        alert('You Lost!')
      }, 10)
    }
  }
}
