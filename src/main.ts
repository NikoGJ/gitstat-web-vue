import { createApp } from 'vue'
import './style.css'
import PrimeVue from 'primevue/config'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeScreen from './components/HomeScreen.vue'
import Lara from '@primeuix/themes/lara'
import { definePreset } from '@primeuix/themes'
import 'chartjs-adapter-luxon'
import 'primeicons/primeicons.css'

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeScreen, meta: { noLayout: true } },
    {
      path: '/config',
      component: () => import('./components/ConfigScreen.vue'),
    },
    {
      path: '/graphs',
      component: () => import('./components/GraphsScreen.vue'),
    },
    {
      path: '/commits',
      component: () => import('./components/CommitsScreen.vue'),
    },
    { path: '/data', component: () => import('./components/DataScreen.vue') },
    { path: '/about', component: () => import('./components/AboutScreen.vue') },
  ],
})

const myTheme = definePreset(Lara, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
})

app
  .use(PrimeVue, {
    theme: {
      preset: myTheme,
      options: {
        darkModeSelector: '.my-app-dark',
      },
    },
  })
  .use(router)
  .mount('#app')
