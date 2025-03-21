<script setup lang="ts">
const loading = ref(false);
const page = ref(1);
const columns = ref<any[][]>([[], []]); // 默认两列

// 根据屏幕宽度计算列数
const calculateColumns = () => {
  const width = window.innerWidth;
  if (width < 768) {
    // 移动端
    return 2;
  } else if (width < 1024) {
    // 平板
    return 3;
  } else if (width < 1600) {
    return 4;
  }
  return 5; // 桌面端
};
// 监听窗口大小变化
onMounted(() => {
  // 初始化列数
  columns.value = Array(calculateColumns())
    .fill([])
    .map(() => []);

  window.addEventListener("resize", () => {
    const newColumnCount = calculateColumns();
    if (newColumnCount !== columns.value.length) {
      // 重新分配现有图片到新的列数
      const allImages = columns.value.flat();
      allImages.sort((a, b) => a.index - b.index);
      columns.value = Array(newColumnCount)
        .fill([])
        .map(() => []);
      allImages.forEach((image, index) => {
        const shortestCol = getShortestColumn();
        columns.value[shortestCol].push(image);
      });
    }
  });
});

const getShortestColumn = () => {
  let minHeight = Infinity;
  let minIndex = 0;

  columns.value.forEach((col, index) => {
    const height = col.reduce((sum, item) => sum + item.height, 0);
    if (height < minHeight) {
      minHeight = height;
      minIndex = index;
    }
  });

  return minIndex;
};

const onload = async () => {
  if (loading.value) return;
  loading.value = true;
  const { data } = await useFetch<any[]>(`https://picsum.photos/v2/list?page=${page.value}`);
  if (data.value) {
    for (let i = 0; i < data.value.length; i++) {
      const shortestCol = getShortestColumn();
      const { width, height } = data.value[i];
      data.value[i].width = Math.floor(width / 100) * 10;
      data.value[i].height = Math.floor((height + Math.random() * 1000) / 100) * 10;
      data.value[i].index = (page.value - 1) * 10 + i + 1;
      columns.value[shortestCol].push(data.value[i]);
    }
    page.value++;
  }
  loading.value = false;
};
</script>

<template>
  <div v-infinite-scroll="onload">
    <div class="flex justify-center gap-2 mx-auto">
      <div v-for="(column, colIndex) in columns" :key="colIndex" class="flex flex-1 flex-col gap-2">
        <!-- <img
          v-for="(item, index) in column"
          :key="`${colIndex}-${index}`"
          :style="{
            width: `${item.width}px`,
            height: `${item.height}px`,
          }"
          :src="`https://picsum.photos/${item.width}/${item.height}`"
          class="w-full hover:scale-102 transition-all duration-300"
        /> -->
        <div
          v-for="(item, index) in column"
          :key="`${colIndex}-${index}`"
          :style="{
            height: `${item.height}px`,
          }"
          class="w-full hover:scale-102 transition-all duration-300 flex justify-center items-center bg-gray-600 rounded-md"
        >
          {{ item.width }}x{{ item.height }}
        </div>
      </div>
    </div>
    <nuxt-icon v-if="loading" name="home/loading" class="w-4 h-4 inline-block mx-auto animate-spin" />
  </div>
</template>
