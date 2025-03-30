<script setup lang="ts">
import type { GameProps, GameScoreEmits } from "~/types/game";

const { visible, fitWidth, levelOptions } = defineProps<GameProps>();

const emit = defineEmits<GameScoreEmits>();

const handleClose = () => {
  emit("on-close", "off");
};

interface MainColor {
  r: number;
  g: number;
  b: number;
}
interface SubColor extends MainColor {}
interface ColorData {
  mainColor: MainColor;
  subColor: SubColor;
  index: number;
  num: number;
}

const level = ref(1); // 1: 低级, 2: 中级, 3: 高级
const score = ref(0);
const isGameOver = ref(false);
const gameList = ref<ColorData[]>([]);
const currentIndex = ref(0);
const currentData = computed(() => {
  return gameList.value[currentIndex.value];
});

// 生成当前关卡的随机颜色数据
const getCurrentColorData = () => {
  for (let i = 0; i < 12; i++) {
    const mainColor = generateRandomColor();
    const subColor = generateSimilarColor(mainColor);
    const indexNumber = generateRandomIndexAndNumber(i);
    gameList.value.push({
      mainColor,
      subColor,
      index: indexNumber.index,
      num: indexNumber.num,
    });
  }
};
// 生成当前副颜色的随机位置和色块数量
const generateRandomIndexAndNumber = (index: number) => {
  let num = 10;
  if (index < 3) num = 4;
  else if (index < 6) num = 9;
  else if (index < 9) num = 16;
  else num = 25;
  return {
    index: Math.ceil(Math.random() * num),
    num,
  };
};
// 生成随机颜色
const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b };
};

// 生成相似颜色
const generateSimilarColor = (color: { r: number; g: number; b: number }) => {
  // 根据难度级别设置固定的颜色差异
  let difference;
  switch (level.value) {
    case 1: // 低级 - 较大差异 (60)
      difference = 60;
      break;
    case 2: // 中级 - 中等差异 (40)
      difference = 40;
      break;
    case 3: // 高级 - 小差异 (20)
      difference = 20;
      break;
    default:
      difference = 50;
  }

  const r = Math.floor(Math.min(Math.max(color.r + difference, 0), 255));
  const g = Math.floor(Math.min(Math.max(color.g + difference, 0), 255));
  const b = Math.floor(Math.min(Math.max(color.b + difference, 0), 255));

  if (r === color.r && g === color.g && b === color.b) {
    console.log("颜色相同，重新生成");
    return generateSimilarColor(color);
  }
  return {
    r,
    g,
    b,
  };
};

// 将RGB对象转换为CSS颜色字符串
const mainColorStyle = computed(() => {
  return `rgb(${currentData.value.mainColor.r}, ${currentData.value.mainColor.g}, ${currentData.value.mainColor.b})`;
});

const subColorStyle = computed(() => {
  return `rgb(${currentData.value.subColor.r}, ${currentData.value.subColor.g}, ${currentData.value.subColor.b})`;
});

// 调整副颜色使其更接近主颜色
const adjustSubColor = (
  mainColor: MainColor,
  subColor: SubColor,
  direction: "closer" | "further"
) => {
  const adjustment = direction === "closer" ? 0.1 : -0.1;
  return {
    r: subColor.r + (mainColor.r - subColor.r) * adjustment,
    g: subColor.g + (mainColor.g - subColor.g) * adjustment,
    b: subColor.b + (mainColor.b - subColor.b) * adjustment,
  };
};

// 重新开始游戏
const resetGame = () => {
  gameList.value = [];
  getCurrentColorData();
  score.value = 0;
  currentIndex.value = 0;
  isGameOver.value = false;
};

const handleClick = (item: number) => {
  if (item === currentData.value.index) {
    if (currentIndex.value === 11) {
      score.value += 10;
      isGameOver.value = true;
      emit("on-game-over", {
        score: score.value,
        level: level.value,
        describe: "恭喜你，通关了！",
      });
    } else {
      score.value += 10;
      currentIndex.value++;
    }
  } else {
    isGameOver.value = true;
    emit("on-game-over", {
      score: score.value,
      level: level.value,
      describe: "很遗憾，你失败了！",
    });
  }
};

onMounted(() => {
  getCurrentColorData();
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
      <h2 class="text-xl font-bold c-blue mb-4">颜色找不同</h2>
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
        <div class="text-base font-bold c-blue ml-10">得分：{{ score }}</div>
      </div>
      <div class="flex flex-row items-center justify-center w-full">
        <div
          class="grid bg-[#f0f0f0] p-2 rounded-md w-full"
          :style="{
            gridTemplateColumns: `repeat(${Math.sqrt(currentData.num)}, 1fr)`,
            gap: '.5rem',
          }"
        >
          <div
            v-for="item in currentData.num"
            :key="item"
            :style="{
              backgroundColor:
                item === currentData.index ? subColorStyle : mainColorStyle,
            }"
            class="w-full aspect-square rounded-md cursor-pointer hover:scale-102 transition-all duration-300"
            @click="handleClick(item)"
          ></div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
