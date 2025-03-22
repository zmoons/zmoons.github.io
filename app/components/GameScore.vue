<script setup lang="ts">
import type { GameScoreProps, GameScoreCloseType, GameScoreEmits } from "~/types/game";

const { gameResult, visible, fitWidth } = defineProps<GameScoreProps>();

const emit = defineEmits<GameScoreEmits>();

const levelName = computed(() => {
  if (gameResult.level === 1) return "初级";
  if (gameResult.level === 2) return "中级";
  if (gameResult.level === 3) return "高级";
  return "";
});
const handleClose = (type: GameScoreCloseType) => {
  emit("on-close", type);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="游戏结束"
    :width="fitWidth"
    :append-to-body="true"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose('off')"
  >
    <div class="p-6 rounded-lg">
      <h2 class="font-bold mb-2">游戏结果</h2>
      <div class="mb-4">
        <p>得分: {{ gameResult.score }}</p>
        <p v-if="gameResult.level">等级: {{ levelName }}</p>
        <p>{{ gameResult.describe }}</p>
      </div>
      <div class="flex gap-4">
        <el-button class="px-4 py-2" type="primary" @click="emit('on-restart')">
          重新开始
        </el-button>
        <el-button class="px-4 py-2" type="danger" @click="emit('on-close', 'exit')">
          退出游戏
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>
