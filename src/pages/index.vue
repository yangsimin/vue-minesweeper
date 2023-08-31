<script setup lang="ts" generic="T extends any, O extends any">
interface BlockState {
  x: number
  y: number
  revealed: boolean
  mine?: boolean
  flagged?: boolean
  adjacentMines: number
}

const WIDTH = 10
const HEIGHT = 10
const state = reactive(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        revealed: false,
        adjacentMines: 0,
      }),
    ),
  ),
)

function generateMines(initial: BlockState) {
  for (const row of state) {
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
  state.forEach((row) => {
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
let dev = $ref(false)

function onClick(block: BlockState) {
  if (!mineGenerated) {
    generateMines(block)
    mineGenerated = true
  }

  block.revealed = true
  if (block.mine) {
    setTimeout(() => {
      alert('BOOOOM!')
      dev = true
    })
  }
  else {
    expendZero(block)
  }
}

function getBlockClass(block: BlockState) {
  if (!block.revealed)
    return 'bg-gray-500/10'
  return block.mine ? 'bg-red-500/50' : numberColors[block.adjacentMines]
}

function getSiblings(block: BlockState) {
  return directions.map(([dx, dy]) => {
    const x2 = block.x + dx
    const y2 = block.y + dy
    if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT)
      return undefined
    return state[y2][x2]
  }).filter(Boolean) as BlockState[]
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
          hover="bg-gray/30"
          :class="getBlockClass(block)"
          @click="onClick(block)"
        >
          <template v-if="block.revealed || dev">
            <div v-if="block.mine" i-mdi:mine />
            <div v-else>
              {{ block.adjacentMines }}
            </div>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
