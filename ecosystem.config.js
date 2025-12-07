module.exports = {
  apps: [
    {
      name: "khaxy-bot",
      script: "apps/bot/dist/index.js",

      env_file: ".env",

      env: {
        NODE_ENV: "production",
      },
      exec_mode: "fork",
      watch: false,
      ignore_watch: ["node_modules"],
    },
  ],
};
