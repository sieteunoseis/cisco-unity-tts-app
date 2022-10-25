module.exports = [
    {
      script: "server.js",
      name: "Cisco Unity TTS",
      watch: true,
      autorestart: true,
      exp_backoff_restart_delay: 360000,
      exec_mode: "cluster",
      instances: 1,
    }
  ];