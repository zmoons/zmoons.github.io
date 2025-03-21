<script setup lang="ts">
const colorMode = useColorMode();
const isMenuOpen = ref(false);
const router = useRouter();
const { t, setLocale } = useI18n();
// 计算可用的语言选项
const availableLocales = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "zh",
    label: "中文",
  },
];

const menuList = ref([
  {
    name: computed(() => t("nav.home")),
    path: "/",
  },
  {
    name: computed(() => t("nav.game")),
    path: "/game",
  },
  {
    name: computed(() => t("nav.article")),
    path: "/article",
  },
  {
    name: computed(() => t("nav.picture")),
    path: "/picture",
  },
  {
    name: computed(() => t("nav.video")),
    path: "/video",
  },
]);

const switchLanguage = (localeCode: any) => {
  // 切换语言
  setLocale(localeCode);
};

const onClick = () => (colorMode.value === "light" ? (colorMode.preference = "dark") : (colorMode.preference = "light"));
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
};

// 阻止事件传播
const stopPropagation = (event: Event) => {
  event.stopPropagation();
};
</script>
<template>
  <div>
    <Head>
      <Title>{{ t("site.title") }}</Title>
      <Meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" />
      <Meta name="description" :content="t('site.description')" />
    </Head>
    <header class="h-12 px-4 flex items-center sticky top-0 z-10 bg-gray-50 dark:bg-[--el-bg-color] border-b border-[--border-color]">
      <nav class="flex items-center w-full">
        <div class="flex items-center">
          <router-link to="/" class="text-xl font-bold text-blue-500">{{ t("site.title") }}</router-link>
        </div>
        <div class="hidden md:flex w-full">
          <router-link
            v-for="item in menuList"
            :key="item.path"
            :to="item.path"
            class="ml-5% first:ml-15% hover:underline cursor-pointer hover:text-blue-500"
            exact-active-class="nuxt-link-active"
          >
            {{ item.name }}
          </router-link>
        </div>
        <div class="flex items-center ml-auto">
          <el-dropdown @command="switchLanguage">
            <span class="flex items-center cursor-pointer ws-nowrap">
              {{ $t("common.language") }}
              <el-icon class="ml-1"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="loc in availableLocales" :key="loc.value" :command="loc.value">
                  {{ loc.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="hidden md:flex ml-auto space-x-4">
          <div @click="onClick" class="text-2xl cursor-pointer">
            <nuxt-icon :name="colorMode.value === 'dark' ? 'theme/light' : 'theme/dark'" />
          </div>
        </div>
        <div @click="toggleMenu" class="md:hidden text-2xl">
          <nuxt-icon :name="isMenuOpen ? 'home/menu-off' : 'home/menu'" />
        </div>
      </nav>
    </header>
    <transition name="el-zoom-in-top">
      <div
        v-if="isMenuOpen"
        class="fixed top-12 left-0 w-full h-[calc(100vh-3rem)] bg-gray-50 dark:bg-[--el-bg-color] z-20 flex flex-col items-center justify-center transform transition-transform duration-300"
        :class="{ 'translate-y-0': isMenuOpen, '-translate-y-full': !isMenuOpen }"
        @click="stopPropagation"
      >
        <div class="my-4" v-for="item in menuList" :key="item.path" @click="toggleMenu">
          <router-link :to="item.path" class="text-lg" exact-active-class="nuxt-link-active">
            {{ item.name }}
          </router-link>
        </div>
      </div>
    </transition>
    <main class="p-6 text-center">
      <NuxtPage />
    </main>
    <!-- <footer class="p-4 text-center">
      <p>{{ t("footer.copyright") }}</p>
      <p>{{ t("footer.contact") }}</p>
    </footer> -->
    <el-backtop class="!right-4 !bottom-10 !h-9 !w-9"></el-backtop>

    <div @click="onClick" class="fixed text-xl bottom-20 right-4 md:hidden bg-gray-100 dark:bg-gray-700 rounded p-2">
      <nuxt-icon :name="colorMode.value === 'dark' ? 'theme/light' : 'theme/dark'" />
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter {
  transform: translateY(100%);
}
.slide-leave-to {
  transform: translateY(100%);
}

.text-lg {
  font-size: 1.25rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.nuxt-link-active {
  font-weight: bold;
  color: #3b82f6;
}
</style>
