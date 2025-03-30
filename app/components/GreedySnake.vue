<script setup lang="ts">
import type { GameProps, GameScoreCloseType, GameScoreEmits } from "~/types/game";

const { visible, fitWidth, levelOptions } = defineProps<GameProps>();
const handleClose = (type: GameScoreCloseType) => {
  clearInterval(timer.value);
  emit("on-close", type);
};
const emit = defineEmits<GameScoreEmits>();

const level = ref(1); // 1: 低级, 2: 中级, 3: 高级
const score = ref(0);
const isGameOver = ref(false);
// 贪吃蛇画布
const canvasRef = ref<HTMLCanvasElement>();
// 贪吃蛇画布上下文
const ctx = ref<CanvasRenderingContext2D>();
// 贪吃蛇画布宽度
// const canvasWidth = ref(0);
// 贪吃蛇画布高度
// const canvasHeight = ref(0);
// 每个方块像素大小
const blockSize = ref(20);
// 贪吃蛇初始位置
const snake = ref([
  { x: 40, y: 0 },
  { x: 20, y: 0 },
  { x: 0, y: 0 },
]);
// 食物位置（随机生成）
const food = ref({
  x: 0,
  y: 0,
});
// 移动方向
const dx = ref(blockSize.value); // 初始向右移动
const dy = ref(0);
const moveIng = ref(false);
// 定时器
const timer = ref<NodeJS.Timeout>();
const timerInterval = computed(() => {
  const time = 500 / level.value - Math.floor(score.value / 3);
  return time > 30 ? time : 30;
});

// 初始化贪吃蛇画布
const initSnake = () => {
  if (!canvasRef.value) return;
  // 获取容器尺寸
  const containerWidth = canvasRef.value.clientWidth * window.devicePixelRatio;
  const containerHeight = canvasRef.value.clientHeight * window.devicePixelRatio;

  // 设置canvas的实际像素尺寸
  canvasRef.value.width = containerWidth - (containerWidth % blockSize.value);
  canvasRef.value.height = containerHeight - (containerHeight % blockSize.value);
  const context = canvasRef.value.getContext("2d");
  if (context) {
    ctx.value = context;
    ctx.value.strokeStyle = "#ccc";
    ctx.value.lineWidth = 1;

    // 绘制垂直线 注意canvas画长度为1px的线时，时左右两边各0.5px，所以需要偏移0.5px
    for (let x = 0; x <= canvasRef.value.width; x += blockSize.value) {
      const adjustedX = x === 0 || x === canvasRef.value.width ? x : x + 0.5;
      ctx.value.beginPath();
      ctx.value.moveTo(adjustedX, 0);
      ctx.value.lineTo(adjustedX, canvasRef.value.height);
      ctx.value.stroke();
    }
    // 绘制水平线
    for (let y = 0; y <= canvasRef.value.height; y += blockSize.value) {
      const adjustedY = y === 0 || y === canvasRef.value.height ? y : y + 0.5;
      ctx.value.beginPath();
      ctx.value.moveTo(0, adjustedY);
      ctx.value.lineTo(canvasRef.value.width, adjustedY);
      ctx.value.stroke();
    }
  }
};
// 随机生成食物
const generateFood = () => {
  let newFood: { x: number; y: number };
  do {
    newFood = {
      x: Math.floor((Math.random() * canvasRef.value!.width) / 20) * 20,
      y: Math.floor((Math.random() * canvasRef.value!.height) / 20) * 20,
    };
  } while (
    snake.value.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
  );
  food.value = newFood;
  ctx.value!.fillStyle = "red";
  ctx.value!.fillRect(food.value.x, food.value.y, blockSize.value, blockSize.value);
};
// 画蛇
const drawSnake = () => {
  if (ctx.value && canvasRef.value) {
    snake.value.forEach((segment) => {
      ctx.value!.fillStyle = "black";
      ctx.value!.fillRect(segment.x, segment.y, blockSize.value, blockSize.value);
    });
  }
};
// 移动蛇
const moveSnake = () => {
  // 创建新蛇头
  const head = { x: snake.value[0].x + dx.value, y: snake.value[0].y + dy.value };
  snake.value.unshift(head);
  // 检查碰撞
  checkCollision();
  if (isGameOver.value) return;
  // 检查是否吃到食物
  const isFoodEaten =
    snake.value[0].x === food.value.x && snake.value[0].y === food.value.y;
  if (isFoodEaten) {
    generateFood();
    score.value += 10;
    moveSnake();
  } else {
    // 没吃到食物则移除蛇尾且重置蛇尾单元格
    const { x, y } = snake.value[snake.value.length - 1];
    resetCell({ x, y });
    snake.value.pop();
  }
  moveIng.value = false;
};
// 重新生成单元格
const resetCell = (position: { x: number; y: number }) => {
  ctx.value!.clearRect(position.x, position.y, blockSize.value, blockSize.value);
  ctx.value!.beginPath();
  ctx.value!.moveTo(position.x + 0.5, position.y);
  ctx.value!.lineTo(position.x + 0.5, position.y + blockSize.value);
  ctx.value!.stroke();

  // 水平线（y+0.5对齐像素）
  ctx.value!.beginPath();
  ctx.value!.moveTo(position.x, position.y + 0.5);
  ctx.value!.lineTo(position.x + blockSize.value, position.y + 0.5);
  ctx.value!.stroke();
};
// 碰撞检测
const checkCollision = () => {
  const head = snake.value[0];
  if (
    head.x < 0 ||
    head.x > canvasRef.value!.width - blockSize.value ||
    head.y < 0 ||
    head.y > canvasRef.value!.height - blockSize.value
  ) {
    isGameOver.value = true;
  }
  if (!isGameOver.value) {
    // 撞自身检测（从第二节点开始检查）
    for (let i = 1; i < snake.value.length; i++) {
      if (snake.value[i].x === head.x && snake.value[i].y === head.y) {
        isGameOver.value = true;
      }
    }
  }
  if (isGameOver.value) {
    emit("on-game-over", {
      score: score.value,
      level: level.value,
      describe: "游戏结束",
    });
    clearInterval(timer.value);
  }
};

// 游戏启动
const startGame = () => {
  initSnake();
  generateFood();
  timer.value = setInterval(() => {
    moveSnake();
    drawSnake();
  }, timerInterval.value);
};
// 重新开始游戏
const resetGame = () => {
  score.value = 0;
  isGameOver.value = false;
  moveIng.value = false;
  snake.value = [
    { x: 40, y: 0 },
    { x: 20, y: 0 },
    { x: 0, y: 0 },
  ];
  dx.value = blockSize.value;
  dy.value = 0;
  startGame();
};

onMounted(() => {
  nextTick(() => {
    startGame();
  });
  document.addEventListener("keydown", (e) => {
    if (isGameOver.value) return;
    if (moveIng.value) return;
    // 防止180度转向（例如：不能从右直接转左）
    moveIng.value = true;
    switch (e.key) {
      case "ArrowUp":
        if (dy.value !== blockSize.value) {
          dx.value = 0;
          dy.value = -blockSize.value;
        }
        break;
      case "ArrowDown":
        if (dy.value !== -blockSize.value) {
          dx.value = 0;
          dy.value = blockSize.value;
        }
        break;
      case "ArrowLeft":
        if (dx.value !== blockSize.value) {
          dx.value = -blockSize.value;
          dy.value = 0;
        }
        break;
      case "ArrowRight":
        if (dx.value !== -blockSize.value) {
          dx.value = blockSize.value;
          dy.value = 0;
        }
        break;
    }
  });
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
      <h2 class="text-xl font-bold c-blue mb-4">贪吃蛇</h2>
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
      <canvas
        ref="canvasRef"
        class="w-full h-full flex items-center justify-center aspect-square"
      ></canvas>
    </div>
  </el-dialog>
</template>
