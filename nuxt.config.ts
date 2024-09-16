export default defineNuxtConfig({
  extends: 'content-wind',

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2024-09-10',
  modules: ['@nuxt/image', 'nuxt-gtag'],
  gtag:{
    id:'G-29H3KSNVGS'
  },
  components: true,  // Enables auto-importing of components

})
