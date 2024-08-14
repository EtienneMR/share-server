// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-30',
  // https://nuxt.com/docs/getting-started/upgrade#testing-nuxt-4
  future: { compatibilityVersion: 4 },

  components: [{
    path: '~/components',
    pathPrefix: false,
  }],

  // https://nuxt.com/modules
  modules: [
    '@nuxthub/core',
    '@nuxt/eslint',
    "@nuxt/ui",
    "nuxt-auth-utils",
    "@nuxtjs/tailwindcss",
    "nuxt-authorization"
  ],

  // https://hub.nuxt.com/docs/getting-started/installation#options
  hub: {
    blob: true,
  },

  // Env variables - https://nuxt.com/docs/getting-started/configuration#environment-variables-and-private-tokens
  runtimeConfig: {
    public: {
      totalStorageSize: Math.pow(10, 10),
      authType: "auth0", // a matching auth-utils provider should exist in /server/api/auth/ (https://www.npmjs.com/package/nuxt-auth-utils#supported-oauth-providers)
    }
  },

  // https://devtools.nuxt.com
  devtools: { enabled: true },
})