<script setup lang="ts">
import Logo from './Logo.vue'
import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import ConfigIcon from '../assets/icons/config.svg?raw'
import ChartIcon from '../assets/icons/chart.svg?raw'
import CommitIcon from '../assets/icons/commit.svg?raw'
import AboutIcon from '../assets/icons/about.svg?raw'
import UploadIcon from '../assets/icons/upload.svg?raw'
import { useRoute } from 'vue-router'

defineProps()

enum MenuModes {
  COLLAPSED = 'collapsed', // TODO not implemented, add this for mobile
  ICONS = 'icons',
  EXPANDED = 'expanded',
}

const mode = useStorage('menu-mode', MenuModes.EXPANDED)
const menuWidth = computed(() =>
  mode.value === MenuModes.EXPANDED ? '11rem' : 'auto',
)

const route = useRoute()
const getActiveStyle = (path: string) => {
  if (route.path === path)
    return {
      fontWeight: 'bold',
      color: 'var(--primary)',
    }
  else return {}
}
</script>
<template>
  <div class="menu-container" :style="{ width: menuWidth }">
    <Button
      v-if="false"
      lass="p-button-rounded p-button-secondary"
      icon="pi pi-angle-double-left"
    ></Button>

    <div style="margin: 1.3rem 0.3rem 0 0.3rem">
      <Logo />
    </div>

    <nav class="nav">
      <RouterLink :to="{ path: '/config' }" :style="getActiveStyle('/config')">
        <div class="menu-icon" v-html="ConfigIcon"></div>
        <span style="margin-left: 1rem">Settings</span>
      </RouterLink>

      <RouterLink :to="{ path: '/graphs' }" :style="getActiveStyle('/graphs')">
        <div class="menu-icon" v-html="ChartIcon"></div>
        <span style="margin-left: 1rem">Graphs</span>
      </RouterLink>

      <RouterLink
        :to="{ path: '/commits' }"
        :style="getActiveStyle('/commits')"
      >
        <div class="menu-icon" v-html="CommitIcon"></div>
        <span style="margin-left: 1rem">Commits</span>
      </RouterLink>

      <RouterLink :to="{ path: '/data' }" :style="getActiveStyle('/data')">
        <div class="menu-icon" v-html="UploadIcon"></div>
        <span style="margin-left: 1rem">Change data</span>
      </RouterLink>

      <RouterLink :to="{ path: '/about' }" :style="getActiveStyle('/about')">
        <div class="menu-icon" v-html="AboutIcon"></div>
        <span style="margin-left: 1rem">About</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.menu-container {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  padding: 0 1rem;
  position: relative;
}

.logo-container {
  margin: 1.3rem 0.3rem 0 0.3rem;
}

.nav {
  flex: 1;
  flex-direction: column;
  margin-top: 1.3rem;

  a {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    color: var(--text);
    text-decoration: none;
    font-size: 1rem;
    font-weight: 400;
    padding: 0.4rem 1.1rem;

    &:hover {
      color: var(--primary);
    }

    .router-link-active {
      font-weight: bold;
      color: var(--primary);
    }
  }
}

.menu-icon {
  width: 1.4rem;
  height: 1.4rem;
}
</style>
