<script setup lang="ts">
import type { GameProps, GameScoreEmits } from "~/types/game";

const { visible, fitWidth, levelOptions } = defineProps<GameProps>();

const emit = defineEmits<GameScoreEmits>();

const handleClose = () => {
  emit("on-close", "off");
};

const level = ref(1); // 1: 低级, 2: 中级, 3: 高级
const score = ref(0);
const isGameOver = ref(false);
const gameList = ref<number[][]>(
  Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0))
);
const gameBgColor = <Record<number, string>>{
  0: "#CDC1B4",
  2: "#EEE4DA",
  4: "#EDE0C8",
  8: "#F2B179",
  16: "#F59563",
  32: "#F67C5F",
  64: "#F65E3B",
  128: "#EDCF72",
  256: "#EDCC61",
  512: "#EDC850",
  1024: "#EDC53F",
  2048: "#EDC22E",
};
const gameTextColor = <Record<number, string>>{
  2: "#776E65",
  4: "#776E65",
  8: "#F9F6F2",
  16: "#F9F6F2",
  32: "#F9F6F2",
  64: "#F9F6F2",
  128: "#F9F6F2",
  256: "#F9F6F2",
  512: "#F9F6F2",
  1024: "#F9F6F2",
  2048: "#F9F6F2",
};

// 随机空白位置生成2或4
const randomBlankPosition = () => {
  const emptyCells = [];
  for (let i = 0; i < gameList.value.length; i++) {
    for (let j = 0; j < gameList.value[i].length; j++) {
      if (gameList.value[i][j] === 0) {
        emptyCells.push({ row: i, col: j });
      }
    }
  }
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  if (emptyCells.length > 0) {
    const { row, col } = emptyCells[randomIndex];
    gameList.value[row][col] =
      Math.random() < (level.value === 1 ? 0.9 : level.value === 2 ? 0.6 : 0.3) ? 2 : 4;
  }
};
// 处理一行左移
const processRow = (row: number[]) => {
  // 1. 去零
  let arr = row.filter((x) => x !== 0);
  let result = [];
  let i = 0;

  // 2. 合并相邻
  while (i < arr.length) {
    if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
      result.push(arr[i] * 2); // 合并
      score.value += arr[i] * 2;
      i += 2; // 跳过下一个
    } else {
      result.push(arr[i]);
      i += 1;
    }
  }

  // 3. 补零到原长度
  while (result.length < row.length) result.push(0);
  return result;
};

// 处理一列下移
const processColumn = (direction: "up" | "down") => {
  for (let i = 0; i < gameList.value.length; i++) {
    let column = gameList.value.map((row) => row[i]);
    if (direction === "down") {
      column.reverse();
    }
    let processed = processRow(column);
    if (direction === "down") {
      processed.reverse();
    }
    // 将处理后的列放回
    for (let j = 0; j < gameList.value.length; j++) {
      gameList.value[j][i] = processed[j];
    }
  }
};
// 移动
const handleMove = (direction: "up" | "down" | "left" | "right") => {
  if (isGameOver.value) return;
  const oldGameList = JSON.stringify(gameList.value);
  if (direction === "up") {
    processColumn("up");
  } else if (direction === "down") {
    processColumn("down");
  } else if (direction === "left") {
    gameList.value = gameList.value.map((row) => processRow(row));
  } else if (direction === "right") {
    gameList.value = gameList.value.map((row) => {
      const newRow = processRow(row.slice().reverse());
      return newRow.reverse();
    });
  }
  if (checkWin(gameList.value)) {
    isGameOver.value = true;
    emit("on-game-over", {
      score: score.value,
      level: level.value,
      describe: "恭喜你，通关了！",
    });
  } else if (checkFail(gameList.value)) {
    isGameOver.value = true;
    emit("on-game-over", {
      score: score.value,
      level: level.value,
      describe: "很遗憾，你失败了！",
    });
  } else {
    if (oldGameList !== JSON.stringify(gameList.value)) {
      randomBlankPosition();
    }
  }
};
// 判断游戏胜利
const checkWin = (grid: number[][]) => {
  for (let row of grid) {
    if (row.includes(2048)) return true; // 存在2048则通关
  }
  return false;
};
// 判断游戏失败
const checkFail = (grid: number[][]) => {
  // 1. 检查空格
  for (let row of grid) {
    if (row.includes(0)) return false;
  }
  // 2. 检查相邻可合并
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      // 检查右侧
      if (j < grid[i].length - 1 && grid[i][j] === grid[i][j + 1]) return false;
      // 检查下方
      if (i < grid.length - 1 && grid[i][j] === grid[i + 1][j]) return false;
    }
  }
  return true; // 游戏结束
};
// 重新开始游戏
const resetGame = () => {
  score.value = 0;
  gameList.value = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => 0));
  randomBlankPosition();
  isGameOver.value = false;
};

const onKeyDownFn = (e: KeyboardEvent) => {
  if (e.key === "ArrowUp") {
    handleMove("up");
  } else if (e.key === "ArrowDown") {
    handleMove("down");
  } else if (e.key === "ArrowLeft") {
    handleMove("left");
  } else if (e.key === "ArrowRight") {
    handleMove("right");
  }
};

// 触摸事件处理
const touchStart = ref({ x: 0, y: 0 });
const minSwipeDistance = 50; // 最小滑动距离

const handleTouchStart = (e: TouchEvent) => {
  touchStart.value = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY,
  };
};

const handleTouchEnd = (e: TouchEvent) => {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;

  const deltaX = endX - touchStart.value.x;
  const deltaY = endY - touchStart.value.y;

  // 判断滑动方向
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // 水平滑动
    if (Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        handleMove("right");
      } else {
        handleMove("left");
      }
    }
  } else {
    // 垂直滑动
    if (Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        handleMove("down");
      } else {
        handleMove("up");
      }
    }
  }
};

const { debounced: onKeyDown } = useDebounce(onKeyDownFn, 100);

onMounted(() => {
  randomBlankPosition();
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("touchstart", handleTouchStart);
  window.addEventListener("touchend", handleTouchEnd);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("touchend", handleTouchEnd);
});

defineExpose({
  resetGame,
});
</script>

<template>
  <el-dialog
    :model-value="visible"
    :width="fitWidth"
    :append-to-body="true"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="flex flex-col items-center justify-center">
      <h2 class="text-xl font-bold c-blue mb-4">2048</h2>
      <div class="flex flex-row items-center justify-center mb-6">
        <div class="w-50">
          <el-select v-model="level" placeholder="请选择难度" @change="resetGame">
            <el-option
              v-for="item in levelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </div>
        <div class="text-base font-bold c-blue ml-5">得分：{{ score }}</div>
      </div>
      <div class="flex flex-row items-center justify-center w-full h-full">
        <div class="w-full h-full grid bg-[#f0f0f0] p-2 rounded-md gap-2">
          <div
            v-for="(row, rowIndex) in gameList"
            :key="rowIndex"
            class="w-full h-full flex flex-row gap-2"
            :style="{
              gridTemplateRows: `repeat(${gameList.length}, 1fr)`,
            }"
          >
            <div
              v-for="(item, itemIndex) in row"
              :key="itemIndex"
              class="w-full h-full rounded-md aspect-square bg-white flex items-center justify-center cursor-pointer font-bold text-xl"
              :style="{
                backgroundColor: gameBgColor[item],
                color: gameTextColor[item],
              }"
            >
              <p v-if="item">{{ item }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
