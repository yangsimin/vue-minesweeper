<script setup lang="ts" generic="T extends any, O extends any">
import { isDev, toggleDev } from '~/composables'
import { GamePlay } from '~/composables/logic'

const WIDTH = 5
const HEIGHT = 5

const play = new GamePlay(WIDTH, HEIGHT)
useStorage('vuesweeper-state', play.state)
const state = computed(() => play.board)

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
