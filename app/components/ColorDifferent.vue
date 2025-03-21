<script setup lang="ts">
import { useThrottle } from "~/composables/useThrottle";

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["on-close"]);
const handleClose = () => {
  emit("on-close");
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

const fitWidth = ref("100%");
const levelOptions = [
  { label: "低级", value: 1 },
  { label: "中级", value: 2 },
  { label: "高级", value: 3 },
];

const level = ref(1); // 1: 低级, 2: 中级, 3: 高级
const score = ref(0);
const isGameOver = ref(false);
const gameList = ref<ColorData[]>([]);
const currentIndex = ref(0);
const currentData = computed(() => {
  return gameList.value[currentIndex.value];
});

const updateWidthFn = () => {
  const width = window.innerWidth;
  if (width < 640) fitWidth.value = "100%";
  else if (width < 1024) fitWidth.value = "50%";
  else fitWidth.value = "30%";
};

const { throttled: updateWidth, cancel } = useThrottle(updateWidthFn, 200);

onMounted(() => {
  updateWidthFn();
  getCurrentColorData();
  window.addEventListener("resize", updateWidth);
});

onUnmounted(() => {
  cancel();
});
// 生成当前关卡的随机颜色数据
function getCurrentColorData() {
  for (let i = 0; i < 12; i++) {
    const mainColor = generateRandomColor();
    const subColor = adjustSubColor(mainColor, generateSimilarColor(mainColor), "further");
    const indexNumber = generateRandomIndexAndNumber(i);
    gameList.value.push({
      mainColor,
      subColor,
      index: indexNumber.index,
      num: indexNumber.num,
    });
  }
}
// 生成当前副颜色的随机位置和色块数量
function generateRandomIndexAndNumber(index: number) {
  let num = 10;
  if (index < 3) num = 4;
  else if (index < 6) num = 9;
  else if (index < 9) num = 16;
  else num = 25;
  return {
    index: Math.floor(Math.random() * num),
    num,
  };
}
// 生成随机颜色
function generateRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return { r, g, b };
}

// 生成相似颜色
function generateSimilarColor(color: { r: number; g: number; b: number }) {
  // 根据难度级别设置固定的颜色差异
  let difference;
  switch (level.value) {
    case 1: // 低级 - 较大差异 (100)
      difference = 100;
      break;
    case 2: // 中级 - 中等差异 (50)
      difference = 50;
      break;
    case 3: // 高级 - 小差异 (25)
      difference = 25;
      break;
    default:
      difference = 100;
  }

  // 固定调整红色通道，使差异更容易识别
  return {
    r: Math.floor(Math.min(Math.max(color.r + difference, 0), 255)),
    g: Math.floor(Math.min(Math.max(color.g + difference, 0), 255)),
    b: Math.floor(Math.min(Math.max(color.b + difference, 0), 255)),
  };
}

// 将RGB对象转换为CSS颜色字符串
const mainColorStyle = computed(() => {
  return `rgb(${currentData.value.mainColor.r}, ${currentData.value.mainColor.g}, ${currentData.value.mainColor.b})`;
});

const subColorStyle = computed(() => {
  return `rgb(${currentData.value.subColor.r}, ${currentData.value.subColor.g}, ${currentData.value.subColor.b})`;
});

// 调整副颜色使其更接近主颜色
function adjustSubColor(mainColor: MainColor, subColor: SubColor, direction: "closer" | "further") {
  const adjustment = direction === "closer" ? 0.1 : -0.1;
  return {
    r: subColor.r + (mainColor.r - subColor.r) * adjustment,
    g: subColor.g + (mainColor.g - subColor.g) * adjustment,
    b: subColor.b + (mainColor.b - subColor.b) * adjustment,
  };
}

// 重新开始游戏
function resetGame() {
  gameList.value = [];
  getCurrentColorData();
  score.value = 0;
  currentIndex.value = 0;
  isGameOver.value = false;
}

function handleClick(item: number) {
  if (item === currentData.value.index) {
    if (currentIndex.value === 11) {
      score.value += 10;
      isGameOver.value = true;
    } else {
      score.value += 10;
      currentIndex.value++;
    }
  } else {
    resetGame();
    isGameOver.value = true;
  }
}
</script>

<template>
  <el-dialog
    v-model="props.visible"
    :width="fitWidth"
    :append-to-body="true"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <div class="flex flex-col items-center justify-center">
      <h2 class="text-xl font-bold c-blue mb-2">颜色找不同</h2>
      <div class="flex flex-row items-center justify-center mb-6">
        <div class="w-50">
          <el-select v-model="level" placeholder="请选择难度" @change="resetGame">
            <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
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
              backgroundColor: item === currentData.index ? subColorStyle : mainColorStyle,
            }"
            class="w-full aspect-square rounded-md cursor-pointer hover:scale-102 transition-all duration-300"
            @click="handleClick(item)"
          ></div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>
