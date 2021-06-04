module.exports = {
  target: "server",
  head: {
    titleTemplate: "%s - Porn Vault",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
  },
  components: true,
  loading: {
    color: "#4455ff",
    height: "5px",
  },
  buildDir: "app_dist",
  buildModules: ["@nuxtjs/composition-api/module", "@nuxt/typescript-build"],
};
