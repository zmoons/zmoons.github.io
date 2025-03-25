<script setup lang="ts">
import ColorDifferent from "~/components/ColorDifferent.vue";
import TwentyFortyEight from "~/components/TwentyFortyEight.vue";
import type { Game, GameResult, GameScoreCloseType } from "~/types/game";

const games = ref<Game[]>([
  {
    name: "颜色找不同",
    component: markRaw(ColorDifferent),
    ref: "ColorDifferent",
    init: false,
    rank: [],
  },
  {
    name: "2048",
    component: markRaw(TwentyFortyEight),
    ref: "TwentyFortyEight",
    init: false,
    rank: [],
  },
]);
// 当前游戏索引
const currentGameIndex = ref<number>(0);
// 当前游戏组件ref
const gameRefList = ref<any>({});
// 游戏结果弹窗
const gameScoreVisible = ref(false);
// 游戏结果
const gameResult = ref<GameResult>({ score: 0, level: 1, describe: "" });
// 是否动画
const isAnimateScale = computed(() => {
  return games.value.filter((game) => game.init).length === 0;
});

// dialog宽度
const fitWidth = ref("100%");
// 设置多个ref
const setItemRef = (el: any, ref: string) => {
  gameRefList.value[ref] = el;
};
// 难度等级
const levelName = (level: number) => {
  if (level === 1) return "初级";
  else if (level === 2) return "中级";
  else return "高级";
};
// 打开游戏
const onGameClick = (game: Game, index: number) => {
  game.init = true;
  currentGameIndex.value = index;
  gameRefList.value[game.ref] = game.ref;
};
// 关闭游戏
const handleGameClose = () => {
  games.value[currentGameIndex.value].init = false;
};
// 关闭游戏结果弹窗或退出游戏
const handleScoreClose = (type: GameScoreCloseType) => {
  if (type === "off") {
    gameScoreVisible.value = false;
  } else if (type === "exit") {
    gameScoreVisible.value = false;
    games.value[currentGameIndex.value].init = false;
  }
  gameRefList.value[games.value[currentGameIndex.value].ref]?.resetGame();
};
// 游戏结束
const handleGameOver = (result: GameResult) => {
  gameScoreVisible.value = true;
  gameResult.value = result;

  const score = games.value[currentGameIndex.value].rank
    .concat({
      score: result.score,
      level: result.level,
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.level - a.level;
    })
    .filter((item) => item.score)
    .slice(0, 3);
  games.value[currentGameIndex.value].rank = score;
  localStorage.setItem(games.value[currentGameIndex.value].ref, JSON.stringify(score));
};
// 重新开始游戏
const handleRestart = () => {
  gameScoreVisible.value = false;
  gameRefList.value[games.value[currentGameIndex.value].ref]?.resetGame();
};
// 更新宽度
const updateWidthFn = () => {
  const width = window.innerWidth;
  if (width < 640) fitWidth.value = "100%";
  else if (width < 1024) fitWidth.value = "50%";
  else fitWidth.value = "30%";
};

const { throttled: updateWidth } = useThrottle(updateWidthFn, 200);

// 读取成绩
const getScore = () => {
  for (const game of games.value) {
    const score = localStorage.getItem(game.ref);
    if (score) {
      game.rank = JSON.parse(score);
    }
  }
};

onMounted(() => {
  getScore();
  updateWidthFn();
  window.addEventListener("resize", updateWidth);
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
    <div
      v-for="(game, index) in games"
      :key="index"
      class="py-4 border rounded-lg hover:shadow-lg hover:dark:shadow-gray-900 hover:cursor-pointer transition-shadow duration-300"
    >
      <h2 class="text-xl font-bold c-blue mb-2">{{ game.name }}</h2>
      <div class="text-red">排行榜</div>
      <div class="flex flex-row items-center justify-center">
        <div v-for="(item, index) in game.rank" :key="index" class="flex flex-row items-center m-1">
          <nuxt-icon v-if="index === 0" name="game/first" filled />
          <nuxt-icon v-if="index === 1" name="game/second" filled />
          <nuxt-icon v-if="index === 2" name="game/third" filled />
          <div v-if="item.level" class="text-3 text-gray-500">[{{ levelName(item.level) }}]</div>
          <div class="text-sm font-bold">{{ item.score }}</div>
        </div>
      </div>
      <div class="relative w-full flex aspect-4/3 items-center justify-center">
        <div
          class="w-40 h-40 rounded-full aspect-square bg-gradient-to-br bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/50 hover:shadow-xl hover:shadow-red-500/70 transition-all duration-300"
          :class="{ 'animate-scale': isAnimateScale }"
          @click="onGameClick(game, index)"
        >
          <span class="text-white font-bold text-lg drop-shadow-lg">开始游戏</span>
        </div>
      </div>
      <component
        v-if="game.init"
        :ref="(el:any) => setItemRef(el, game.ref)"
        :is="game.component"
        :visible="game.init"
        :fit-width="fitWidth"
        @on-close="handleGameClose"
        @on-game-over="handleGameOver"
      />
    </div>
    <GameScore :visible="gameScoreVisible" :fit-width="fitWidth" :gameResult="gameResult" @on-close="handleScoreClose" @on-restart="handleRestart" />
  </div>
</template>
<style scoped>
@keyframes scale {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
.animate-scale {
  animation: scale 1.5s ease-in-out infinite;
}
</style>
