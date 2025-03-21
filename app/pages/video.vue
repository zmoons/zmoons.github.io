<script setup lang="ts">
const { data } = await useFetch("https://api.github.com/users/nuxt");
const active = ref(true);
</script>

<template>
  <div>
    <h1 v-for="item in 10" :key="item">视频</h1>
    <!-- <pre v-if="data">{{ data }}</pre>
    <h1 v-else>About</h1> -->
  </div>
</template>
