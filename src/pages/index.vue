<script setup lang="ts" generic="T extends any, O extends any">
import type { BlockState } from '~/types'

const WIDTH = 5
const HEIGHT = 5
const state = ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        revealed: false,
        adjacentMines: 0,
        flagged: false,
      }),
    ),
  ),
)

function generateMines(initial: BlockState) {
  for (const row of state.value) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) <= 1)
        continue
      if (Math.abs(initial.y - block.y) <= 1)
        continue
      block.mine = Math.random() < 0.2
    }
  }
  updateNumbers()
}

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

const numberColors = [
  'text-transparent',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-orange-500',
  'text-red-500',
  'text-purple-500',
  'text-pink-500',
]

function updateNumbers() {
  state.value.forEach((row) => {
    row.forEach((block) => {
      if (block.mine)
        return
      getSiblings(block).forEach((b) => {
        if (b.mine)
          block.adjacentMines++
      })
    })
  })
}

function expendZero(block: BlockState) {
  if (block.adjacentMines)
    return

  getSiblings(block).forEach((b) => {
    if (!b.revealed) {
      b.revealed = true
      expendZero(b)
    }
  })
}

let mineGenerated = false
const dev = true
let gameOver = false

function onClick(block: BlockState) {
  if (gameOver)
    return

  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }

  block.revealed = true
  if (block.mine) {
    setTimeout(() => {
      alert('BOOOOM!')
      gameOver = true
    })
  }
  else {
    expendZero(block)
  }
}

function onRightClick(block: BlockState) {
  if (gameOver)
    return

  if (block.revealed)
    return
  block.flagged = !block.flagged
}

function getBlockClass(block: BlockState) {
  if (block.flagged)
    return 'bg-gray-500/10'
  if (!block.revealed)
    return 'bg-gray-500/10 hover:bg-gray-500/30'

  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}

function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    return state.value[y2][x2]
  }).filter(Boolean) as BlockState[]
}

watchEffect(checkGameState)

function checkGameState() {
  const blocks = state.value.flat()
  if (!blocks.some(block => !block.mine && !block.revealed)) {
    alert('You win!')
    gameOver = true
  }
}
</script>

<template>
  <div>
    MineSweeper
    <div p5>
      <div
        v-for="row, y in state"
        :key="y"
        flex="~ gap-1"

        my-1 items-center justify-center
      >
        <button
          v-for="block, x in row"
          :key="x"
          h-10 w-10
          flex="~"
          items-center justify-center
          border="1 gray-400/10"
          align-middle
          :class="getBlockClass(block)"
          @click="onClick(block)"
          @contextmenu.prevent="onRightClick(block)"
        >
          <template v-if="block.flagged">
            <div i-mdi:flag text-red-500 />
          </template>
          <template v-else-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi:mine />
            <div v-else-if="block.flagged">
              x
            </div>
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
