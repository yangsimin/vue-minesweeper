<script setup lang="ts" generic="T extends any, O extends any">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const WIDTH = 8
const HEIGHT = 8
const MINES = 10

const play = new GamePlay(WIDTH, HEIGHT, MINES)
useStorage('vuesweeper-state', play.state)
const state = computed(() => play.board)

const mineCount = computed(() => {
  return play.blocks.reduce(
    (sum, block) => sum + (block.mine ? 1 : 0)
    , 0)
})

watchEffect(() => {
  play.checkGameState()
})
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
        <MineBlock
          v-for="block, x in row" :key="x"
          :block="block"
          @click="play.onClick(block)"
          @contextmenu.prevent="play.onRightClick(block)"
        />
      </div>
    </div>
    <div>
      Count: {{ mineCount }}
    </div>
    <div flex="~ gap-1" justify-center>
      <button btn @click="toggleDev()">
        {{ isDev ? 'DEV' : 'NORMAL' }}
      </button>
      <button btn @click="play.reset()">
        RESET
      </button>
    </div>
  </div>
</template>
