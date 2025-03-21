<script setup lang="ts">
const name = ref("");
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">欢迎来到我的博客</h1>
    <p v-for="i in 100" :key="i" class="mt-4">这里是一些精彩的内容...</p>
  </div>
</template>

<style scoped></style>
