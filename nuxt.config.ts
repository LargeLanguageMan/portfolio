
export default defineNuxtConfig({
  extends: 'content-wind',

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2024-09-10',
  modules: ['@nuxt/image'],

 //  css: [
 //    '@coreui/coreui/dist/css/coreui.min.css' // Add CoreUI CSS
 //  ],
  components: true,  // Enables auto-importing of components

})




