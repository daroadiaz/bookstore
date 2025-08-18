// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false, // SPA mode
  
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
    }
  },

  nitro: {
    preset: 'node-server',
    host: process.env.NITRO_HOST || '0.0.0.0',
    port: parseInt(process.env.NITRO_PORT || '3001')
  },

  devServer: {
    host: '0.0.0.0',
    port: 3001
  },

  // Módulos necesarios
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],

  // Configuración de desarrollo
  devtools: { enabled: true },

  // Configuración de build
  build: {
    transpile: []
  },

  // Configuración de CSS
  css: ['~/assets/css/main.css'],

  // Auto-importar componentes
  components: true
})