<script setup lang="ts">
import ColorDifferent from "~/components/ColorDifferent.vue";
const games = ref([
  {
    name: "颜色找不同",
    url: "/img/color.png",
    component: markRaw(ColorDifferent),
    init: false,
  },
]);
const onGameClick = (game: any) => {
  game.init = true;
};
const handleClose = (game: any) => {
  game.init = false;
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <div
      v-for="game in games"
      :key="game.name"
      class="p-4 border rounded-lg hover:shadow-lg hover:dark:shadow-gray-900 hover:cursor-pointer transition-shadow duration-300"
      @click="onGameClick(game)"
    >
      <h2 class="text-xl font-bold c-blue mb-2">{{ game.name }}</h2>
      <img :src="game.url" alt="game" class="w-full rounded-lg" />
      <component v-if="game.init" :is="game.component" :visible="game.init" @on-close="handleClose(game)" />
    </div>
  </div>
</template>
